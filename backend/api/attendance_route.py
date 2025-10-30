from fastapi import APIRouter, Request, HTTPException, Query
import datetime
import os
from bson import ObjectId

from models.attendance_schema import RfidTapResponse, AttendanceRecordsResponse, StudentSummarySchema

from .attendance_utils import (
    get_mongo_client,
    ensure_mongo_available,
    now_iso_z,
    parse_iso,
    duration_seconds,
    format_short_duration,
    to_iso_z,
    ensure_dt,
    student_canonical_id,
    build_attendance_filter,
    recompute_flags_and_update,
    insert_or_update_log,
    handle_attendance_record,
)

router = APIRouter()
DB_NAME = "attendance_system"
COL_NAME = "subject_attendance"

@router.post("/rfid", response_model=RfidTapResponse)
async def rfid_tap(rfid_uid: str = Query(..., description="RFID UID"), request: Request = None):
    """
    Tap handler:
    - find student by rfid_uid
    - find current schedule for student's student_id
    - upsert one subject_attendance record per student+subject+lesson_date
    - 1st tap -> set time_in
    - 2nd tap -> set time_out
    - 3rd tap -> create break from previous time_out -> now and clear time_out (student inside)
    Break durations computed and stored as duration_seconds and duration (short string). Uses student's student_id_no if present, else uses string(_id).
    """
    client = get_mongo_client(request)
    ensure_mongo_available(client, request)
    db = client[DB_NAME]
    students_col = db["students"]
    schedules_col = db["class_schedules"]
    att_col = db[COL_NAME]

    student = students_col.find_one({"rfid_uid": rfid_uid})
    if not student:
        raise HTTPException(status_code=404, detail="RFID not found")

    now_dt = datetime.datetime.now(datetime.timezone.utc)
    weekday_short = now_dt.strftime("%a")
    student_id = student.get("student_id")
    
    sched_filt = {"student_id": student_id, "day": weekday_short}
    schedules_from_db = schedules_col.find(sched_filt)

    active_schedule = None
    
    for schedule_doc in schedules_from_db:
        start_time_from_db = schedule_doc.get("start_time")
        end_time_from_db = schedule_doc.get("end_time")

        if isinstance(start_time_from_db, datetime.datetime) and isinstance(end_time_from_db, datetime.datetime):
            schedule_start_time = start_time_from_db.time()
            schedule_end_time = end_time_from_db.time()
            today_date_utc = now_dt.date()
            start_dt_today = datetime.datetime.combine(today_date_utc, schedule_start_time)
            end_dt_today = datetime.datetime.combine(today_date_utc, schedule_end_time)
            start_dt_today_aware = start_dt_today.replace(tzinfo=datetime.timezone.utc)
            end_dt_today_aware = end_dt_today.replace(tzinfo=datetime.timezone.utc)
            if end_dt_today_aware < start_dt_today_aware:
                end_dt_today_aware += datetime.timedelta(days=1)
            if start_dt_today_aware <= now_dt < end_dt_today_aware:
                active_schedule = schedule_doc
                break

    if not active_schedule:
        raise HTTPException(status_code=400, detail=f"No class is currently in session for student_id '{student_id}' at this time.")

    subject = active_schedule.get("subject")
    start_time = active_schedule.get("start_time")
    end_time = active_schedule.get("end_time")
    lesson_date = now_dt.date().isoformat()
    
    filt = build_attendance_filter(student, lesson_date, subject)
    existing = att_col.find_one(filt)
    now_iso = now_iso_z()
    action = "tap_in" if not existing else ("tap_out" if existing.get("time_out") is None else "tap_in")
    student_id_str = student_canonical_id(student)
    insert_or_update_log(db, student_id_str, student, student_id, lesson_date, now_iso, action)
    handle_attendance_record(db, student, student_id, subject, lesson_date, now_dt, now_iso, start_time, end_time)
    recompute_flags_and_update(db, filt, start_time, end_time, student, subject)

    doc = att_col.find_one(filt)
    if not doc:
        raise HTTPException(status_code=500, detail="Attendance record could not be found after update.")

    return {"doc": doc}

@router.get("/records", response_model=StudentSummarySchema)
async def get_attendance_records(
    request: Request,
    student_id: str = Query(..., description="Filter by student_id"),
    subject: str = Query(None, description="Filter by subject"),
    lesson_date: str = Query(None, description="Filter by lesson date (YYYY-MM-DD)"),
):
    """
    Retrieve attendance records from MongoDB, filtered by student_id, subject, and lesson_date.
    """
    client = get_mongo_client(request)
    ensure_mongo_available(client, request)
    db = client[DB_NAME]
    att_col = db[COL_NAME]

    query = {"student_id": student_id}
    if subject:
        query["subject"] = subject
    if lesson_date:
        query["lesson_date"] = lesson_date

    records = list(att_col.find(query))

    return {"records": records}