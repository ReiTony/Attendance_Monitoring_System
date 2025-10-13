from beanie import Document
from pydantic import Field
from typing import Literal, Optional
from datetime import datetime, date
from pymongo import IndexModel, ASCENDING, DESCENDING

Status = Literal["Present", "Late", "Absent"]

class Attendance(Document):
    student_id: str = Field(index=True)      
    student_name: str
    section: str = Field(index=True)
    subject: Optional[str] = None
    lesson_date: date = Field(index=True)      
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: Status
    from_device: Optional[str] = None

    class Settings:
        name = "attendance_logs"
        indexes = [
            IndexModel([("section", ASCENDING), ("lesson_date", ASCENDING)]),
            IndexModel([("student_id", ASCENDING), ("lesson_date", ASCENDING)]),
            IndexModel([("lesson_date", DESCENDING), ("timestamp", DESCENDING)]),
        ]
