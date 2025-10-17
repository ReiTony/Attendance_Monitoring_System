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

@router.get("/attendance-summary", response_model=AttendanceReport, tags=["Reports"])
async def get_attendance_summary(
    request: Request,
    section: Optional[str] = Query(None, description="Filter by section"),
    subject: Optional[str] = Query(None, description="Filter by subject")
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
        match_stage["subject"] = subject
        report_details = f"{report_details.replace('Summary', 'Summary for Subject')} {subject}"
    if match_stage:
        pipeline.append({"$match": match_stage})

    # Stage 2: Group by the student's string ID and name
    pipeline.append({
        "$group": {
            "_id": {
                "student_id": "$student_id",
                "student_name": "$student_name",
                "section": "$section"
            },
            "total_lates": {
                "$sum": {
                    # --- THIS IS THE FIX ---
                    # Use the object-based syntax for $cond
                    "$cond": {
                        "if": {"$eq": ["$late", True]},
                        "then": 1,
                        "else": 0
                    }
                }
            },
            "total_absences": {
                "$sum": {
                    # --- ALSO FIX THIS ONE for consistency ---
                    "$cond": {
                        "if": {"$eq": ["$status", "Absent"]},
                        "then": 1,
                        "else": 0
                    }
                }
            }
        }
    })
    
    # Stage 3: Reshape the output (no change)
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
    
    # Stage 4: Sort the results alphabetically (no change)
    pipeline.append({"$sort": {"student_name": 1}})

    results = list(att_col.aggregate(pipeline))
    return {
        "report_details": report_details.strip(),
        "student_summaries": results
    }