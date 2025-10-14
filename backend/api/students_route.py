# routes/students_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from models.user import Student
from core.dependencies import role_required   

router = APIRouter()

# Schemas 
class StudentCreate(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str  = Field(..., min_length=2, max_length=50)
    section: str    = Field(..., min_length=1, max_length=20)
    rfid_uid: str   = Field(..., min_length=5, max_length=50)
    student_id_no: str = Field(..., min_length=5, max_length=50)
    seat_row: int   = Field(..., ge=1)
    seat_col: int   = Field(..., ge=1)

class StudentOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    section: str
    student_id_no: str
    seat_row: int
    seat_col: int

# Routes 
@router.post(
    "/",
    response_model=StudentOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(role_required("teacher"))],
)
async def create_student(payload: StudentCreate):
    if await Student.find_one(Student.rfid_uid == payload.rfid_uid):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "RFID already assigned")

    if await Student.find_one(Student.student_id_no == payload.student_id_no):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Student ID already exists")

    seat_conflict = await Student.find_one(
        Student.section == payload.section,
        Student.seat_row == payload.seat_row,
        Student.seat_col == payload.seat_col,
    )
    if seat_conflict:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Seat already taken in this section")

    student = Student(
        first_name=payload.first_name,
        last_name=payload.last_name,
        role="student", 
        section=payload.section,
        rfid_uid=payload.rfid_uid,
        student_id_no=payload.student_id_no,
        seat_row=payload.seat_row,
        seat_col=payload.seat_col,
    )
    await student.insert()

    return StudentOut(
        id=str(student.id),
        first_name=student.first_name,
        last_name=student.last_name,
        section=student.section,
        student_id_no=student.student_id_no,
        seat_row=student.seat_row,
        seat_col=student.seat_col,
    )
