from beanie import Document
from pydantic import Field
from typing import Literal, Optional
from datetime import datetime  # <-- Make sure this is 'datetime', NOT 'time'
from pymongo import IndexModel, ASCENDING

Day = Literal["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

class Schedule(Document):
    section: str = Field(..., min_length=1, max_length=20, index=True)  
    subject: str = Field(..., min_length=2)
    teacher_name: str = Field(..., min_length=2)
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