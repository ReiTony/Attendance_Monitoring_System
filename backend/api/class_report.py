from fastapi import APIRouter, Request, Query
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from .attendance_utils import get_mongo_client, ensure_mongo_available

router = APIRouter()
DB_NAME = "attendance_system"

class StudentAttendanceSummary(BaseModel):
    student_id: str
    student_name: str
    section: str
    total_lates: int
    total_absences: int

class AttendanceReport(BaseModel):
    report_details: str
    student_summaries: List[StudentAttendanceSummary]

class SectionTotalsRequest(BaseModel):
    section: str = Field(..., min_length=1, description="Exact section to summarize")

@router.get("/attendance-summary", tags=["Reports"], response_model=AttendanceReport)
async def get_attendance_summary(
    request: Request,
    section: Optional[str] = Query(None, description="Filter by section"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    debug: bool = Query(False, description="If true return intermediate per-subject aggregation for debugging")
):
    client = get_mongo_client(request)
    ensure_mongo_available(client, request)
    db = client[DB_NAME]
    att_col = db["subject_attendance"]

    pipeline: List[Dict[str, Any]] = []
    match_stage: Dict[str, Any] = {}
    report_details = "Overall Attendance Summary"

    if section:
        match_stage["section"] = section
        report_details = f"Attendance Summary for Section: {section}"
    if subject:
        match_stage["subject"] = {"$regex": subject, "$options": "i"}
        report_details = f"{report_details.replace('Summary', 'Summary for Subject')} {subject}"
    if match_stage:
        pipeline.append({"$match": match_stage})

    pipeline.extend([
        {"$addFields": {"subject_code": {"$arrayElemAt": [{"$split": ["$subject", " "]}, 0]}}},
        {"$group": {
            "_id": {
                "student_id": "$student_id",
                "student_name": "$student_name",
                "section": "$section",
                "subject_code": "$subject_code",
            },
            "lates_per_subject": {"$sum": {"$cond": [{"$eq": ["$late", True]}, 1, 0]}},
            "absences_per_subject": {"$sum": {"$cond": [{"$eq": ["$status", "Absent"]}, 1, 0]}},
        }},
        {"$project": {
            "student_id": "$_id.student_id",
            "student_name": "$_id.student_name",
            "section": "$_id.section",
            "subject_code": "$_id.subject_code",
            "lates_per_subject": 1,
            "absences_per_subject": 1,
            "extra_absences_from_lates": {
                "$floor": {"$divide": [{"$ifNull": ["$lates_per_subject", 0]}, 3]}
            },
            "residual_lates": {"$mod": [{"$ifNull": ["$lates_per_subject", 0]}, 3]},
        }},
    ])

    per_subjects_snapshot = None
    if debug:
        per_subjects_snapshot = list(att_col.aggregate(pipeline))

    pipeline.extend([
        {"$group": {
            "_id": {
                "student_id": "$student_id",
                "student_name": "$student_name",
                "section": "$section",
            },
            "total_lates": {"$sum": "$residual_lates"},
            "total_absences": {
                "$sum": {"$add": ["$absences_per_subject", "$extra_absences_from_lates"]}
            },
        }},
        {"$project": {
            "_id": 0,
            "student_id": "$_id.student_id",
            "student_name": "$_id.student_name",
            "section": "$_id.section",
            "total_lates": 1,
            "total_absences": 1,
        }},
        {"$sort": {"student_name": 1}},
    ])

    results = list(att_col.aggregate(pipeline))
    if debug:
        return {"report_details": report_details.strip(), "student_summaries": results, "debug": {"per_subjects": per_subjects_snapshot}}
    return {"report_details": report_details.strip(), "student_summaries": results}

@router.post("/attendance/section-totals", tags=["Reports"], response_model=AttendanceReport)
async def attendance_section_totals(request: Request, payload: SectionTotalsRequest) -> Dict[str, Any]:
    client = get_mongo_client(request)
    ensure_mongo_available(client, request)
    db = client[DB_NAME]
    att_col = db["subject_attendance"]

    pipeline: List[Dict[str, Any]] = [
        # {"$match": {"section": {"$regex": f"^{payload.section}$", "$options": "i"}}},
        {"$match": {"section": payload.section}},
        {"$group": {
            "_id": {
                "student_id": "$student_id",
                "student_name": "$student_name",
                "section": "$section",
            },
            "total_lates": {
                "$sum": {"$cond": [{"$eq": [{"$ifNull": ["$late", False]}, True]}, 1, 0]}
            },
            "total_absences": {
                "$sum": {"$cond": [{"$eq": [{"$ifNull": ["$status", ""]}, "Absent"]}, 1, 0]}
            },
        }},
        {"$project": {
            "_id": 0,
            "student_id": "$_id.student_id",
            "student_name": "$_id.student_name",
            "section": "$_id.section",
            "total_lates": 1,
            "total_absences": 1,
        }},
        {"$sort": {"student_name": 1}},
    ]

    results = list(att_col.aggregate(pipeline))
    return {
        "report_details": f"Totals per student for Section: {payload.section}",
        "student_summaries": results,
    }
