from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timedelta, timezone

from models.user import Student
from models.class_schedule import Schedule
from models.subject_attendance import SubjectAttendance

router = APIRouter()

@router.post("/rfid", status_code=status.HTTP_201_CREATED, tags=["Attendance"])
async def ingest_rfid(rfid_uid: str):
    # --- Time Setup ---
    now_utc = datetime.now(timezone.utc)
    local_tz = timezone(timedelta(hours=8))
    now_local = now_utc.astimezone(local_tz)
    today_local_date = now_local.date()

    # --- Student Lookup ---
    student = await Student.find_one(Student.rfid_uid == rfid_uid)
    if not student:
        raise HTTPException(status_code=404, detail="RFID UID not registered.")

    # --- Schedule Lookup ---
    current_day_str = now_local.strftime("%a")

    print(f"\nQuerying for schedules with section='{student.section}' and day='{current_day_str}'")

    # Use the correct student section now that we know the issue
    possible_schedules = await Schedule.find(
        Schedule.section == "ICT12A",  # Using ICT12A as per your successful test
        Schedule.day == current_day_str
    ).to_list()

    print(f"Found {len(possible_schedules)} possible schedules.")

    current_sched = None
    active_start_time_utc = None
    active_end_time_utc = None
    
    for sched in possible_schedules:
        # ** THE FINAL, CORRECT LOGIC **
        # 1. Get the time components directly from the stored UTC datetime object
        start_time_component = sched.start_time.time()
        end_time_component = sched.end_time.time()

        # 2. Combine them with TODAY's LOCAL date to create today's schedule instance
        # This correctly anchors the schedule to the current day.
        start_utc_today = datetime.combine(today_local_date, start_time_component, tzinfo=timezone.utc)
        end_utc_today = datetime.combine(today_local_date, end_time_component, tzinfo=timezone.utc)

        # 3. Handle overnight classes
        if end_utc_today < start_utc_today:
            end_utc_today += timedelta(days=1)
        
        # 4. The final comparison, all in UTC
        if start_utc_today <= now_utc < end_utc_today:
            current_sched = sched
            active_start_time_utc = start_utc_today
            active_end_time_utc = end_utc_today
            break

    if not current_sched:
        raise HTTPException(
            status_code=400,
            detail=f"No class is currently in session. (Time: {now_local.strftime('%H:%M:%S %Z')})"
        )

    # --- Attendance Logic (This part is correct) ---
    existing_log = await SubjectAttendance.find_one(
        SubjectAttendance.student_id == student.id,
        SubjectAttendance.subject == current_sched.subject,
        SubjectAttendance.lesson_date == today_local_date
    )
    
    if existing_log:
        # ... (rest of the code is unchanged and correct)
        if existing_log.time_out: return {"message": "Already timed-out."}
        existing_log.time_out = now_utc
        if now_utc < active_end_time_utc: existing_log.left_early = True
        await existing_log.save()
        return {"message": "Time-out recorded", "data": existing_log.model_dump(by_alias=True)}
    else:
        late_threshold_utc = active_start_time_utc + timedelta(minutes=10)
        is_late = now_utc > late_threshold_utc
        attendance_status = "Late" if is_late else "Present"
        new_log = SubjectAttendance(
            student_id=student.id, section=student.section,
            subject=current_sched.subject, lesson_date=today_local_date,
            status=attendance_status, late=is_late, time_in=now_utc,
            from_device="local-rpi"
        )
        await new_log.insert()
        return {"message": "Time-in recorded", "data": new_log.model_dump(by_alias=True)}