# routes/attendance_route.py
from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timedelta, time
from models.user import Student
from models.class_schedule import Schedule
from models.attendance import Attendance

router = APIRouter()

def is_within(now_t: time, start: time, end: time) -> bool:
    return start <= now_t <= end

@router.post("/rfid", status_code=status.HTTP_201_CREATED)
async def ingest_rfid(rfid_uid: str):
    now = datetime.utcnow()
    today = now.date()
    now_t = now.time()

    student = await Student.find_one(Student.rfid_uid == rfid_uid)
    if not student:
        raise HTTPException(status_code=404, detail="Unknown RFID card")

    student_name = f"{student.first_name} {student.last_name}".strip()

    schedules = await Schedule.find(Schedule.section == student.section).to_list()
    current_sched = None
    for sched in schedules:
        if sched.day == now.strftime("%a") and is_within(now_t, sched.start_time, sched.end_time):
            current_sched = sched
            break

    if current_sched:
        subject = current_sched.subject
        late_after = (
            datetime.combine(today, current_sched.start_time) + timedelta(minutes=10)
        ).time()
        status = "Late" if now_t > late_after else "Present"
    else:
        subject = None
        status = "Present"

    existing_log = await Attendance.find_one(
        Attendance.student_id == str(student.id),
        Attendance.lesson_date == today,
    )

    if existing_log:
        existing_log.time_out = now
        await existing_log.save()
        return {
            "message": f"{student_name} time-out recorded",
            "student": student_name,
            "status": existing_log.status,
            "section": existing_log.section,
            "subject": existing_log.subject,
            "time_in": existing_log.time_in.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "time_out": now.strftime("%Y-%m-%d %H:%M:%S UTC"),
        }

    log = Attendance(
        student_id=str(student.id),
        student_name=student_name,
        section=student.section,
        subject=subject,
        lesson_date=today,
        time_in=now,
        time_out=None,
        status=status,
        from_device="local-rpi",
    )
    await log.insert()

    return {
        "message": f"{student_name} marked {status} (time-in)",
        "student": student_name,
        "status": status,
        "section": student.section,
        "subject": subject,
        "time_in": now.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "time_out": None,
    }
