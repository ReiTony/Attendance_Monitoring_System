from beanie import Document
from pydantic import Field
from typing import Literal, Optional
from datetime import datetime  # <-- Make sure this is 'datetime', NOT 'time'
from pymongo import IndexModel, ASCENDING

Day = Literal["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

class Schedule(Document):
    section: str = Field(index=True)
    subject: str
    teacher_name: str
    day: Day
    start_time: datetime  # <-- THIS MUST BE datetime
    end_time: datetime    # <-- THIS MUST BE datetime
    room: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "class_schedules"
        indexes = [
            IndexModel([("section", ASCENDING), ("day", ASCENDING), ("start_time", ASCENDING)]),
        ]