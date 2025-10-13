from beanie import Document
from pydantic import Field, EmailStr
from typing import Literal
from datetime import datetime
from pymongo import IndexModel, ASCENDING

Role = Literal["teacher", "student"]

class Teacher(Document):
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr = Field(...)
    password: str = Field(..., min_length=8)
    role: Role = "teacher"
    section: str = Field(..., min_length=1, max_length=20)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "teachers"
        indexes = [
            IndexModel([("email", ASCENDING)], unique=True),
            IndexModel([("section", ASCENDING)]),
        ]
        
class Student(Document):
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    role: Role = "student"
    section: str = Field(..., min_length=1, max_length=20)
    rfid_uid: str = Field(..., min_length=5, max_length=50)
    student_id_no: str = Field(..., min_length=5, max_length=50)
    seat_row: int = Field(..., ge=1)
    seat_col: int = Field(..., ge=1)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "students"
        indexes = [
            IndexModel([("student_id_no", ASCENDING)], unique=True),
            IndexModel([("rfid_uid", ASCENDING)], unique=True),
            IndexModel([("section", ASCENDING), ("seat_row", ASCENDING), ("seat_col", ASCENDING)], unique=True),
            IndexModel([("section", ASCENDING)]),
        ]