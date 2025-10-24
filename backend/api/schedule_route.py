from fastapi import APIRouter, Request, Query
from typing import Optional, List
from pydantic import BaseModel, Field
from .attendance_utils import get_mongo_client, ensure_mongo_available
from models.class_schedule import Schedule

router = APIRouter()
DB_NAME = "attendance_system"

ClassSchedule = Schedule

@router.get("/class-schedules", response_model=List[ClassSchedule])
async def get_class_schedules(
    request: Request,
    section: Optional[str] = Query(None, description="Filter by section"),
):
    """
    Retrieve all class schedules from MongoDB, optionally filtered by section.
    """
    client = get_mongo_client(request)
    ensure_mongo_available(client, request)
    db = client[DB_NAME]
    sched_col = db["class_schedules"]

    query = {}
    if section:
        query["section"] = section

    schedules = list(sched_col.find(query))

    # Convert ObjectId and datetime fields to string for JSON serialization
    for sched in schedules:
        sched["_id"] = str(sched["_id"])
        if "start_time" in sched:
            sched["start_time"] = str(sched["start_time"])
        if "end_time" in sched:
            sched["end_time"] = str(sched["end_time"])
        if "created_at" in sched:
            sched["created_at"] = str(sched["created_at"])

    return schedules
