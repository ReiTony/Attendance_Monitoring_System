from beanie import Document
from pydantic import BaseModel, Field
from typing import List

class ScheduleItem(BaseModel):
    subject: str
    day: str
    start_time: str
    end_time: str
    room: str

class Schedule(Document):
    section: str
    adviser_id: str  
    schedule: List[ScheduleItem]

    class Settings:
        name = "schedules"
