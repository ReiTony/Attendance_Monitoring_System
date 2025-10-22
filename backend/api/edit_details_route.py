from fastapi import APIRouter, HTTPException, status
from beanie import PydanticObjectId
from models.user import Student
from models.subject_attendance import SubjectAttendance
from pydantic import BaseModel
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter()

# --- Direct MongoDB client for legacy attendance collection ---
MONGODB_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGODB_URI)
db = client["attendance_system"]
legacy_collection = db["subject_attendance"]


# --- Schema for updating ---
class UpdateStudentIn(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    section: Optional[str]
    rfid_uid: Optional[str]
    student_id_no: Optional[str]
    seat_row: Optional[int]
    seat_col: Optional[int]
    is_active: Optional[bool]


# --- Schema for output ---
class StudentOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    section: str
    rfid_uid: str
    student_id_no: str
    seat_row: int
    seat_col: int
    is_active: bool
    role: str


@router.put("/students/{student_id_no}", response_model=StudentOut, status_code=status.HTTP_200_OK)
async def update_student(student_id_no: str, payload: UpdateStudentIn):
    # Find student by student_id_no
    student = await Student.find_one(Student.student_id_no == student_id_no)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Extract provided fields only
    update_data = payload.dict(exclude_unset=True)

    # --- Check for duplicates (RFID / Student ID) ---
    if "rfid_uid" in update_data:
        existing_rfid = await Student.find_one(Student.rfid_uid == update_data["rfid_uid"])
        if existing_rfid and existing_rfid.id != student.id:
            raise HTTPException(status_code=400, detail="RFID already registered")

    if "student_id_no" in update_data:
        existing_id = await Student.find_one(Student.student_id_no == update_data["student_id_no"])
        if existing_id and existing_id.id != student.id:
            raise HTTPException(status_code=400, detail="Student ID already registered")

    # --- Update the Student record ---
    await student.set(update_data)

    # --- Prepare synced fields for attendance ---
    new_name = f"{student.first_name} {student.last_name}".strip()
    new_section = student.section

    # --- ✅ Update all SubjectAttendance documents (Beanie-managed) ---
    await SubjectAttendance.find(
        SubjectAttendance.student_id == PydanticObjectId(student.id)
    ).update_many(
        {
            "$set": {
                "student_name": new_name,
                "section": new_section,
            }
        }
    )

    # --- ✅ Update legacy collection directly (matches by student_id_no field) ---
    await legacy_collection.update_many(
        {"student_id": student.student_id_no},  # legacy collection uses string IDs
        {
            "$set": {
                "student_name": new_name,
                "section": new_section,
            }
        }
    )

    # --- Return updated student info ---
    return StudentOut(
        id=str(student.id),
        first_name=student.first_name,
        last_name=student.last_name,
        section=student.section,
        rfid_uid=student.rfid_uid,
        student_id_no=student.student_id_no,
        seat_row=student.seat_row,
        seat_col=student.seat_col,
        is_active=student.is_active,
        role=student.role,
    )
