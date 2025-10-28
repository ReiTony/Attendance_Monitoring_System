from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from pydantic import BaseModel, Field
from models.user import Student
from core.dependencies import role_required   
from typing import List, Optional

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
    student_id_no: str
    first_name: str
    last_name: str
    section: str
    seat_row: int
    seat_col: int
    rfid_uid: str

# Routes 
@router.post(
    "/create",
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
        rfid_uid=student.rfid_uid,
    )


@router.get(
    "/",
    response_model=List[StudentOut],
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(role_required("teacher"))],
)
async def list_students(
    section: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    sort_by: str = Query("last_name"),
    sort_dir: str = Query("asc"),
):
    query = {}
    if section:
        query["section"] = section
        
    sort_field_map = {
        "last_name": Student.last_name,
        "first_name": Student.first_name,
        "student_id_no": Student.student_id_no,
        "rfid_uid": Student.rfid_uid,
        "seat_row": Student.seat_row,
        "seat_col": Student.seat_col,
    }
    sort_field = sort_field_map.get(sort_by, Student.last_name)
    sort_expr = sort_field if sort_dir.lower() == "asc" else -sort_field

    cursor = (
        Student.find(query)
        .sort(sort_expr)    
        .skip(skip)
        .limit(limit)
    )

    items = await cursor.to_list()
    return [
        StudentOut(
            id=str(s.id),
            first_name=s.first_name,
            last_name=s.last_name,
            section=s.section,
            student_id_no=s.student_id_no,
            rfid_uid=s.rfid_uid,
            seat_row=s.seat_row,
            seat_col=s.seat_col,
        )
        for s in items
    ]




@router.get(
    "/{student_id_no}",
    response_model=StudentOut,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(role_required("teacher"))],
)
async def get_student(student_id_no: str):
    student = await Student.find_one(Student.student_id_no == student_id_no)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    return StudentOut(
        id=str(student.id),
        first_name=student.first_name,
        last_name=student.last_name,
        section=student.section,
        student_id_no=student.student_id_no,
        rfid_uid=student.rfid_uid,
        seat_row=student.seat_row,
        seat_col=student.seat_col,
    )





@router.delete(
    "/{student_id_no}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(role_required("teacher"))],
)
async def delete_student(student_id_no: str):
    student = await Student.find_one(Student.student_id_no == student_id_no)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    await student.delete()
    return Response(status_code=status.HTTP_204_NO_CONTENT)