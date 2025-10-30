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
    start: datetime.datetime
    end: datetime.datetime
    duration_seconds: int
    duration: str

class AttendanceResponse(BaseModel):
    """
    Schema for a single attendance record returned by the API.
    This mirrors the structure of the `Attendance` Beanie Document.
    """
    id: str = Field(..., alias="_id", description="The unique MongoDB document ID.")
    
    # --- Student and Class Information ---
    student_id: str
    student_name: str
    rfid_uid: str
    section: str
    subject: str
    lesson_date: datetime.date
    
    # --- Timestamps and Duration ---
    time_in: Optional[datetime.datetime] = None
    time_out: Optional[datetime.datetime] = None
    duration_seconds: Optional[float] = None
    breaks: List[BreakRecord] = []

    # --- Status Flags ---
    is_present: bool
    is_late: bool
    
    # --- Metadata ---
    from_device: Optional[str] = None
    
    # --- Timestamps from Beanie's TimeStamp mixin ---
    created_at: datetime.datetime
    updated_at: datetime.datetime

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