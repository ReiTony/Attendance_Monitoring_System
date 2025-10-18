from beanie import Document, PydanticObjectId
from pydantic import Field
from typing import Literal, Optional
from datetime import date, datetime
from pymongo import IndexModel, ASCENDING, DESCENDING

Status = Literal["Present", "Absent", "Late"]

class SubjectAttendance(Document):
    """
    Represents a single attendance record for a student in a specific subject on a given day.
    """
    # Using PydanticObjectId is the standard way to reference other documents.
    student_id: PydanticObjectId = Field(index=True)
    
    section: str = Field(index=True)
    subject: str
    
    lesson_date: date
    
    status: Status
    
    # Booleans to quickly flag important states.
    late: bool = False
    left_early: bool = False
    
    # Use Optional datetime for time_in/time_out as an absent student won't have them.
    time_in: Optional[datetime] = None
    time_out: Optional[datetime] = None
    
    remarks: Optional[str] = None
    from_device: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

    converted_to_absence: bool = Field(default=False)

    class Settings:
        # Standard MongoDB naming convention is plural and snake_case.
        name = "subject_attendances"
        indexes = [
            # Compound index for the most common query:
            # "Find all attendance for a specific class on a specific day"
            IndexModel(
                [
                    ("section", ASCENDING),
                    ("subject", ASCENDING),
                    ("lesson_date", DESCENDING), # Usually you want the most recent dates first
                ]
            ),
            # Compound index for another common query:
            # "Find all attendance for a specific student"
            IndexModel(
                [
                    ("student_id", ASCENDING),
                    ("subject", ASCENDING),
                    ("late", DESCENDING),
                    ("converted_to_absence", ASCENDING),
                ]
            ),
        ]