from beanie import Document
from pydantic import Field
from datetime import datetime

class Attendance(Document):
    student_id: str  
    student_name: str
    section: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str  # "Present", "Absent", or "Late"

    class Settings:
        name = "attendance_logs"
