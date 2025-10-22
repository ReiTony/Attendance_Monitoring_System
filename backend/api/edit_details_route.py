from fastapi import APIRouter, HTTPException, status
from beanie import PydanticObjectId
from models.user import Student  
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

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


# --- Schema for output (optional, but nice) ---
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


@router.put("/students/{student_id}", response_model=StudentOut, status_code=status.HTTP_200_OK)
async def update_student(student_id: str, payload: UpdateStudentIn):
    # Find the student by ID
    student = await Student.find_one(Student.student_id_no == student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Convert only fields provided (exclude None)
    update_data = payload.dict(exclude_unset=True)

    # Handle unique fields manually (e.g. prevent duplicate RFID or student ID)
    if "rfid_uid" in update_data:
        existing_rfid = await Student.find_one(Student.rfid_uid == update_data["rfid_uid"])
        if existing_rfid and existing_rfid.id != student.id:
            raise HTTPException(status_code=400, detail="RFID already registered")

    if "student_id_no" in update_data:
        existing_id = await Student.find_one(Student.student_id_no == update_data["student_id_no"])
        if existing_id and existing_id.id != student.id:
            raise HTTPException(status_code=400, detail="Student ID already registered")

    # Apply update
    await student.set(update_data)

    # Return updated record
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
