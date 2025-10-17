from fastapi import APIRouter, Request, HTTPException, Query
import datetime
import os
from bson import ObjectId

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

@router.post("/rfid")
async def rfid_tap(rfid_uid: str = Query(..., description="RFID UID"), request: Request = None):
    """
    Tap handler:
    - find student by rfid_uid
    - find current schedule for student's section
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

    # find schedule for student's section matching today's weekday and current time
    now_dt = datetime.datetime.now(datetime.timezone.utc)
    weekday_short = now_dt.strftime("%a")  # "Fri"
    section = student.get("section")

    sched_filt = {"section": section, "day": {"$regex": weekday_short, "$options": "i"}}
    schedule = schedules_col.find_one(sched_filt)

    if not schedule:
        raise HTTPException(status_code=400, detail=f"No class is currently in session for section {section} on {weekday_short}")

    # if schedule has explicit start/end datetimes, ensure now is inside
    start_time = schedule.get("start_time")
    end_time = schedule.get("end_time")
    try:
        if isinstance(start_time, datetime.datetime) and isinstance(end_time, datetime.datetime):
            if not (start_time <= now_dt <= end_time):
                raise HTTPException(status_code=400, detail="No class is currently in session.")
    except HTTPException:
        raise
    except Exception:
        pass  # ignore comparison issues; proceed

    subject = schedule.get("subject")
    lesson_date = now_dt.date().isoformat()
    # build filter and inspect existing record to decide action
    filt = build_attendance_filter(student, lesson_date, subject)
    existing = att_col.find_one(filt)
    now_iso = now_iso_z()

    # determine action
    action = "tap_in" if not existing else ("tap_out" if existing.get("time_out") is None else "tap_in")

    # attendance raw logging (tolerant)
    student_id_str = student_canonical_id(student)
    insert_or_update_log(db, student_id_str, student, section, lesson_date, now_iso, action)

    # handle main attendance record (tap in/out/breaks)
    handle_attendance_record(db, student, section, subject, lesson_date, now_dt, now_iso, start_time, end_time)

    recompute_flags_and_update(att_col, filt, start_time, end_time)

    # return resulting document
    doc = att_col.find_one(filt)
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"]) 
    return {"doc": doc}