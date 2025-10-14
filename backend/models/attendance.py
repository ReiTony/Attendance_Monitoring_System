from beanie import Document
from pydantic import Field
from typing import Literal, Optional
from datetime import datetime, date
from pymongo import IndexModel, ASCENDING, DESCENDING

Status = Literal["Present", "Late", "Absent"]

class Attendance(Document):
    student_id: str = Field(..., index=True)
    student_name: str = Field(..., min_length=2)
    section: str = Field(..., min_length=1, max_length=20, index=True)
    subject: Optional[str] = None
    lesson_date: date = Field(default_factory=date.today, index=True)
    time_in: Optional[datetime] = Field(default_factory=datetime.utcnow)
    time_out: Optional[datetime] = None
    status: Status
    from_device: Optional[str] = Field(default="local-rpi")

    class Settings:
        name = "attendance_logs"
        indexes = [
            IndexModel([("student_id", ASCENDING), ("lesson_date", ASCENDING)], unique=True),
            IndexModel([("section", ASCENDING), ("lesson_date", ASCENDING)]),
            IndexModel([("lesson_date", DESCENDING), ("time_in", DESCENDING)]),
        ]
