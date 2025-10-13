from beanie import Document
from pydantic import Field
from typing import Literal, Optional
from datetime import time, datetime
from pymongo import IndexModel, ASCENDING

Day = Literal["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

class Schedule(Document):
    section: str = Field(index=True)
    subject: str
    teacher_name: str
    day: Day
    start_time: time
    end_time: time
    room: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "class_schedules"
        indexes = [
            IndexModel([("section", ASCENDING), ("day", ASCENDING), ("start_time", ASCENDING)]),
        ]
