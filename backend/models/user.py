from beanie import Document
from pydantic import Field, EmailStr
from typing import Literal, Optional
from datetime import datetime

Role = Literal["teacher", "student", "section_viewer"]

class User(Document):
    name: str
    email: Optional[EmailStr] = Field(default=None, index=True, unique=True)
    password: Optional[str] = None
    role: Role
    section: Optional[str] = Field(default=None, index=True)
    rfid_uid: Optional[str] = Field(default=None, index=True, unique=True)
    student_id_no: Optional[str] = None
    seat_row: Optional[int] = None
    seat_col: Optional[int] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
