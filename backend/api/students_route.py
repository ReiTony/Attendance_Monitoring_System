from fastapi import APIRouter, Depends, HTTPException
from models.user import User
from core.dependecies import role_required
from pydantic import BaseModel

router = APIRouter(prefix="/students", tags=["students"])

class StudentCreate(BaseModel):
    name: str
    section: str
    student_id_no: str
    rfid_uid: str
    seat_row: int | None = None
    seat_col: int | None = None

@router.post("/", dependencies=[Depends(role_required("teacher"))])
async def create_student(payload: StudentCreate):
    if await User.find_one(User.rfid_uid == payload.rfid_uid):
        raise HTTPException(400, "RFID already assigned")
    student = User(
        name=payload.name,
        email=None,
        password=None,
        role="student",
        section=payload.section,
        rfid_uid=payload.rfid_uid,
        student_id_no=payload.student_id_no,
        seat_row=payload.seat_row,
        seat_col=payload.seat_col,
    )
    await student.insert()
    return {"id": str(student.id), "message": "Student created"}
