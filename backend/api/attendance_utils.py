from typing import Optional, Any, Dict, List, Tuple
import datetime
import os
from pymongo import MongoClient, errors
from bson import ObjectId
from fastapi import Request, HTTPException

MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://antoniocarino_db_user:QW81AfzTCAeOC9Cg@attendance.ap2uhos.mongodb.net/?retryWrites=true&w=majority&appName=Attendance"
)
DB_NAME = "attendance_system"
COL_NAME = "subject_attendance"


def get_mongo_client(request: Request) -> MongoClient:
    client = getattr(request.app.state, "mongo_client", None)
    if client is None:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    return client


def ensure_mongo_available(client: MongoClient, request: Request) -> None:
    # raise HTTPException(503) if server not available
    try:
        if not getattr(request.app.state, "mongo_client", None):
            client.server_info()
    except errors.ServerSelectionTimeoutError as e:
        raise HTTPException(status_code=503, detail=f"Cannot connect to MongoDB: {e}")


def now_iso_z() -> str:
    return datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def parse_iso(ts: Optional[Any]) -> datetime.datetime:
    if ts is None:
        raise ValueError("timestamp is None")
    if isinstance(ts, datetime.datetime):
        return ts if ts.tzinfo else ts.replace(tzinfo=datetime.timezone.utc)
    if isinstance(ts, str):
        return datetime.datetime.fromisoformat(ts.replace("Z", "+00:00"))
    raise ValueError("unsupported timestamp type")


def duration_seconds(start_ts: Any, end_ts: Any) -> Optional[int]:
    try:
        s = parse_iso(start_ts)
        e = parse_iso(end_ts)
        return int((e - s).total_seconds())
    except Exception:
        return None


def format_short_duration(seconds: Optional[int]) -> Optional[str]:
    if seconds is None:
        return None
    if seconds < 60:
        return f"{int(seconds)}s"
    mins = int(seconds // 60)
    return f"{mins}m"


def to_iso_z(value: Any) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, str):
        return value
    if isinstance(value, datetime.datetime):
        return value.astimezone(datetime.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    return str(value)


def ensure_dt(v: Any) -> Optional[datetime.datetime]:
    # return timezone-aware UTC datetime or None
    if v is None:
        return None
    if isinstance(v, datetime.datetime):
        if v.tzinfo:
            return v.astimezone(datetime.timezone.utc)
        return v.replace(tzinfo=datetime.timezone.utc)
    if isinstance(v, str):
        try:
            return datetime.datetime.fromisoformat(v.replace("Z", "+00:00")).astimezone(datetime.timezone.utc)
        except Exception:
            return None
    return None


def student_canonical_id(student: Dict[str, Any]) -> str:
    return student.get("student_id_no") or str(student.get("_id"))


def build_attendance_filter(student: Dict[str, Any], lesson_date: str, subject: str) -> Dict[str, Any]:
    student_id_str = student_canonical_id(student)
    or_clauses = [{"student_id": student_id_str}]
    if isinstance(student.get("_id"), ObjectId):
        or_clauses.append({"student_id": student.get("_id")})
    return {"lesson_date": lesson_date, "subject": subject, "$or": or_clauses}


def recompute_flags_and_update(att_col, doc_filter: Dict[str, Any], start_time: Any, end_time: Any) -> None:
    try:
        doc = att_col.find_one(doc_filter)
        if not doc:
            return
        sched_start = ensure_dt(start_time)
        sched_end = ensure_dt(end_time)
        time_in_dt = ensure_dt(doc.get("time_in"))
        time_out_dt = ensure_dt(doc.get("time_out"))

        late_flag = False
        left_early_flag = False

        if time_in_dt and sched_start:
            late_flag = time_in_dt > sched_start
        if time_out_dt and sched_end:
            left_early_flag = time_out_dt < sched_end

        status_val = "Late" if late_flag else doc.get("status", "Present")

        updates = {}
        if doc.get("late") != late_flag:
            updates["late"] = late_flag
        if doc.get("left_early") != left_early_flag:
            updates["left_early"] = left_early_flag
        if doc.get("status") != status_val:
            updates["status"] = status_val
        if updates:
            updates["updated_at"] = datetime.datetime.utcnow()
            att_col.update_one({"_id": doc["_id"]}, {"$set": updates})
    except Exception:
        # keep behavior tolerant to failures
        return


def insert_or_update_log(db, student_id_str: str, student: Dict[str, Any], section: str, lesson_date: str, now_iso: str, action: str) -> None:
    try:
        logs_col = db["attendance_logs"]
        last_open_log = logs_col.find_one({"student_id": student_id_str, "lesson_date": lesson_date, "time_out": None}, sort=[("time_in", -1)])

        if action == "tap_in":
            log_doc = {
                "student_id": student_id_str,
                "student_name": f"{student.get('first_name','')} {student.get('last_name','')}".strip(),
                "section": section,
                "lesson_date": lesson_date,
                "time_in": now_iso,
                "time_out": None,
                "from_device": "rfid",
                "created_at": datetime.datetime.utcnow(),
                "updated_at": datetime.datetime.utcnow()
            }
            logs_col.insert_one(log_doc)
        elif action == "tap_out":
            if last_open_log:
                logs_col.update_one({"_id": last_open_log["_id"]}, {"$set": {"time_out": now_iso, "updated_at": datetime.datetime.utcnow()}})
            else:
                log_doc = {
                    "student_id": student_id_str,
                    "student_name": f"{student.get('first_name','')} {student.get('last_name','')}".strip(),
                    "section": section,
                    "lesson_date": lesson_date,
                    "time_in": None,
                    "time_out": now_iso,
                    "from_device": "rfid",
                    "created_at": datetime.datetime.utcnow(),
                    "updated_at": datetime.datetime.utcnow()
                }
                logs_col.insert_one(log_doc)
    except Exception:
        # don't fail main flow if logging fails
        return


def handle_attendance_record(db, student: Dict[str, Any], section: str, subject: str, lesson_date: str, now_dt: datetime.datetime, now_iso: str, start_time: Any, end_time: Any) -> None:
    att_col = db[COL_NAME]
    student_id_str = student_canonical_id(student)
    filt = build_attendance_filter(student, lesson_date, subject)
    existing = att_col.find_one(filt)

    # decide action
    if not existing:
        # tap in: compute late flag
        late_flag = False
        try:
            if isinstance(start_time, datetime.datetime):
                late_flag = now_dt > start_time
            elif isinstance(start_time, str):
                late_flag = now_dt > parse_iso(start_time)
        except Exception:
            late_flag = False

        status_val = "Late" if late_flag else "Present"

        doc = {
            "student_id": student_id_str,
            "student_name": f"{student.get('first_name','')} {student.get('last_name','')}".strip(),
            "section": section,
            "subject": subject,
            "lesson_date": lesson_date,
            "time_in": now_iso,
            "time_out": None,
            "status": status_val,
            "late": late_flag,
            "left_early": False,
            "breaks": [],
            "total_break_seconds": 0,
            "remarks": None,
            "from_device": "rfid",
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow()
        }
        att_col.update_one({"lesson_date": lesson_date, "subject": subject, "student_id": student_id_str}, {"$set": doc}, upsert=True)
        return

    existing_time_out = existing.get("time_out")
    if existing_time_out is None:
        # currently inside -> tap out
        left_early_flag = False
        try:
            if isinstance(end_time, datetime.datetime):
                left_early_flag = now_dt < end_time
            elif isinstance(end_time, str):
                left_early_flag = now_dt < parse_iso(end_time)
        except Exception:
            left_early_flag = False

        update_set = {"time_out": now_iso, "left_early": left_early_flag, "updated_at": datetime.datetime.utcnow()}
        att_col.update_one({"_id": existing["_id"]}, {"$set": update_set})
        return

    # currently outside -> tap in: append break from prev time_out -> now, clear time_out
    prev_out_iso = to_iso_z(existing_time_out)
    new_break = {"start": prev_out_iso, "end": now_iso}
    ds = duration_seconds(prev_out_iso, now_iso)
    if ds is not None:
        new_break["duration_seconds"] = ds
        new_break["duration"] = format_short_duration(ds)
    breaks = existing.get("breaks") or []
    keys = {(to_iso_z(b.get("start")), to_iso_z(b.get("end"))) for b in breaks if b.get("start")}
    key_new = (to_iso_z(new_break["start"]), to_iso_z(new_break["end"]))
    if key_new not in keys:
        breaks.append(new_break)
    total = 0
    for b in breaks:
        try:
            total += int(b.get("duration_seconds") or 0)
        except Exception:
            pass

    update_set = {"breaks": breaks, "total_break_seconds": total, "time_out": None, "left_early": False, "updated_at": datetime.datetime.utcnow()}
    att_col.update_one({"_id": existing["_id"]}, {"$set": update_set})
