from fastapi import APIRouter, Request, Query, HTTPException
from typing import Optional, List
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

@router.get("/attendance-summary", tags=["Reports"])
async def get_attendance_summary(
    request: Request,
    section: Optional[str] = Query(None, description="Filter by section"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    debug: bool = Query(False, description="If true return intermediate per-subject aggregation for debugging")
):
    """
    Retrieves a summary of lates and absences for all students.
    """
    client = get_mongo_client(request)
    ensure_mongo_available(client, request)
    db = client[DB_NAME]
    att_col = db["subject_attendance"]

    pipeline = []
    
    # Stage 1: Initial filtering (no change)
    match_stage = {}
    report_details = "Overall Attendance Summary"
    if section:
        match_stage["section"] = section
        report_details = f"Attendance Summary for Section: {section}"
    if subject:
        # Use case-insensitive substring matching so users can search by code/acronym
        # e.g. searching for 'webdev' should match 'SP-ICT6 (WebDev)'.
        match_stage["subject"] = {"$regex": subject, "$options": "i"}
        report_details = f"{report_details.replace('Summary', 'Summary for Subject')} {subject}"
    if match_stage:
        pipeline.append({"$match": match_stage})

    # Normalize subject to a subject_code (first token before space) so variants like
    # "SP-ICT6 (WebDev)" and "SP-ICT6 (WebDev1)" are grouped together.
    pipeline.append({
        "$addFields": {
            "subject_code": {
                "$arrayElemAt": [{ "$split": ["$subject", " "] }, 0]
            }
        }
    })

    # Stage 2: Group by student + subject_code to compute per-subject lates/absences
    pipeline.append({
        "$group": {
            "_id": {
                "student_id": "$student_id",
                "student_name": "$student_name",
                "section": "$section",
                "subject_code": "$subject_code"
            },
            "lates_per_subject": {
                "$sum": {"$cond": [{"$eq": ["$late", True]}, 1, 0]}
            },
            "absences_per_subject": {
                "$sum": {"$cond": [{"$eq": ["$status", "Absent"]}, 1, 0]}
            }
        }
    })

    # Stage 3: For each subject_code compute extra absences gained by converting lates (floor(lates/3))
    pipeline.append({
        "$project": {
            "student_id": "$_id.student_id",
            "student_name": "$_id.student_name",
            "section": "$_id.section",
            "subject_code": "$_id.subject_code",
            "lates_per_subject": 1,
            "absences_per_subject": 1,
            "extra_absences_from_lates": {
                "$floor": {
                    "$divide": [
                        {"$ifNull": ["$lates_per_subject", 0]},
                        3
                    ]
                }
            },
            "residual_lates": {
                "$mod": [
                    {"$ifNull": ["$lates_per_subject", 0]},
                    3
                ]
            }
        }
    })

    # If debug requested, capture the per-subject aggregation output here
    per_subjects_snapshot = None
    if debug:
        per_subjects_snapshot = list(att_col.aggregate(pipeline))

    # Stage 4: Sum across subjects per student
    pipeline.append({
        "$group": {
            "_id": {"student_id": "$student_id", "student_name": "$student_name", "section": "$section"},
            "total_lates": {"$sum": "$residual_lates"},
            "total_absences": {"$sum": {"$add": ["$absences_per_subject", "$extra_absences_from_lates"]}}
        }
    })

    # Stage 5: Reshape the output
    pipeline.append({
        "$project": {
            "_id": 0,
            "student_id": "$_id.student_id",
            "student_name": "$_id.student_name",
            "section": "$_id.section",
            "total_lates": "$total_lates",
            "total_absences": "$total_absences"
        }
    })

    # Stage 6: Sort the results alphabetically
    pipeline.append({"$sort": {"student_name": 1}})

    results = list(att_col.aggregate(pipeline))
    if debug:
        return {
            "report_details": report_details.strip(),
            "student_summaries": results,
            "debug": {"per_subjects": per_subjects_snapshot}
        }

    return {
        "report_details": report_details.strip(),
        "student_summaries": results
    }