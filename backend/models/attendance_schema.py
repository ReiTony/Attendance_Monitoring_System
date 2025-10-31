import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class PydanticConfig:
    """Pydantic model configuration."""
    from_attributes = True
    orm_mode = True
    allow_population_by_field_name = True
    json_encoders = {
        datetime.datetime: lambda dt: dt.isoformat().replace('+00:00', 'Z'),
        datetime.date: lambda d: d.isoformat()
    }

class BreakRecord(BaseModel):
    """Schema for a single break period within an attendance record."""
    start: Optional[datetime.datetime] = None
    end: Optional[datetime.datetime] = None
    duration_seconds: Optional[int] = None
    duration: Optional[str] = None

class AttendanceResponse(BaseModel):
    """
    Schema for a single attendance record returned by the API.
    This mirrors the structure of the `Attendance` Beanie Document.
    """
    id: Optional[str] = Field(None, alias="_id")
    # Student and class info
    student_id: Optional[str] = None
    student_name: Optional[str] = None
    section: Optional[str] = None
    subject: Optional[str] = None
    lesson_date: Optional[str] = None  

    # Timestamps and breaks
    time_in: Optional[str] = None
    time_out: Optional[str] = None
    total_break_seconds: Optional[int] = None
    breaks: List[BreakRecord] = Field(default_factory=list)

    # Status flags in your docs
    status: Optional[str] = None
    late: Optional[bool] = None
    left_early: Optional[bool] = None

    # Metadata
    remarks: Optional[str] = None
    from_device: Optional[str] = None
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None

    class Config(PydanticConfig):
        pass

# --- Response Models for API Endpoints ---

class RfidTapResponse(BaseModel):
    """Response schema for the POST /rfid endpoint."""
    doc: AttendanceResponse

class StudentSummarySchema(BaseModel):
    """Schema for the summary of a single student's attendance."""
    student_id: str
    student_name: str
    section: Optional[str] = None
    total_lates: int
    total_absences: int
    
    class Config(PydanticConfig):
        pass

class AttendanceRecordsResponse(BaseModel):
    """Response schema for the GET /records endpoint."""
    records: List[AttendanceResponse]