from typing import Optional, Any, Dict, List, Tuple
import datetime
import os
from pymongo import MongoClient, errors
from bson import ObjectId
from fastapi import Request, HTTPException
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGO_URI")
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

LATES_FOR_ABSENCE = 3

def check_and_convert_lates_to_absence(db, student, subject):
    """
    Checks if a student has accumulated enough lates for a subject to be marked absent.
    If so, it flags the lates as converted and updates the latest record to 'Absent'.
    """
    att_col = db["subject_attendance"]
    
    # --- THIS IS THE FIX ---
    # Use the student's string ID number from the 'student_id_no' field.
    student_id_str = student.get("student_id_no")
    if not student_id_str:
        print(f"WARNING: Could not run late conversion for student {student.get('_id')} because they are missing 'student_id_no'.")
        return False

    # 1. Find all 'Late' records for this student and subject that have NOT been converted yet.
    late_filter = {
        "student_id": student_id_str, # Query with the correct string ID
        "subject": subject,
        "late": True,
        "converted_to_absence": {"$ne": True}
    }
    unconverted_lates = list(att_col.find(late_filter).sort("lesson_date", 1))

    # 2. If the number of unconverted lates reaches the threshold...
    if len(unconverted_lates) >= LATES_FOR_ABSENCE:
        print(f"Found {len(unconverted_lates)} unconverted lates for student {student_id_str}. Triggering absence conversion.")
        
        records_to_convert = unconverted_lates[:LATES_FOR_ABSENCE]
        ids_to_convert = [rec["_id"] for rec in records_to_convert]
        triggering_record_id = ids_to_convert[-1]

        # 3. Update the triggering record to be an 'Absent' record.
        att_col.update_one(
            {"_id": triggering_record_id},
            {
                "$set": {
                    "status": "Absent",
                    "late": False,
                    "remarks": f"Automatically converted from {LATES_FOR_ABSENCE} lates."
                }
            }
        )

        # 4. Mark all the used late records as 'converted'.
        att_col.update_many(
            {"_id": {"$in": ids_to_convert}},
            {"$set": {"converted_to_absence": True, "late": False}}
        )
        
        return True # Indicate that a conversion happened
        
    return False # No conversion happened

def student_canonical_id(student: Dict[str, Any]) -> str:
    return student.get("student_id_no") or str(student.get("_id"))


def build_attendance_filter(student: Dict[str, Any], lesson_date: str, subject: str) -> Dict[str, Any]:
    student_id_str = student.get("student_id_no")
    if not student_id_str:
        # This error is important for data integrity.
        # It means you scanned a card for a student who doesn't have a student ID number.
        student_object_id = student.get("_id")
        raise ValueError(f"Student with _id '{student_object_id}' is missing the 'student_id_no' field.")
    return {
        "student_id": student_id_str, # Store and query by ObjectId
        "lesson_date": lesson_date,
        "subject": subject,
    }


def recompute_flags_and_update(db, filt, start_time, end_time, student, subject):
    """
    Recomputes flags like 'late' and 'left_early' based on the current record state.
    Also triggers the logic to convert lates to absences.
    """
    att_col = db["subject_attendance"]
    doc = att_col.find_one(filt)
    if not doc:
        return

    update_doc = {}
    is_late = False

    

    # Calculate 'late' flag
    if doc.get("time_in"):
        time_in_dt = ensure_dt(doc["time_in"])
        late_threshold = ensure_dt(start_time) + datetime.timedelta(minutes=10)
        if time_in_dt > late_threshold:
            is_late = True
    update_doc["late"] = is_late

    if doc.get("status") != "Absent":
        update_doc["status"] = "Late" if is_late else "Present"

    # Calculate 'left_early' flag
    if doc.get("time_out"):
        time_out_dt = ensure_dt(doc["time_out"])
        if time_out_dt < ensure_dt(end_time):
            update_doc["left_early"] = True
        else:
            update_doc["left_early"] = False

    
    if update_doc:
        att_col.update_one(filt, {"$set": update_doc})

    # --- NEW LOGIC INTEGRATION ---
    # After updating flags, always attempt to convert accumulated lates into absences.
    # This ensures conversions aren't missed if the most-recent tap wasn't itself flagged late
    # (for example when records are backfilled or updated).
    try:
        check_and_convert_lates_to_absence(db, student, subject)
    except Exception:
        # don't let conversion failures break the main flow
        pass


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
