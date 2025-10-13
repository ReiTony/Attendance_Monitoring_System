# routes/auth_route.py
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
import logging

from models.user import Teacher
from core.security import hash_password, verify_password, create_access_token

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("auth_route")
router = APIRouter()

# Schemas (request/response) 
class RegisterIn(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str  = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    section: str = Field(..., min_length=1, max_length=20)

class TeacherOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: EmailStr
    section: str
    role: str = "teacher"

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Routes 
@router.post("/register", response_model=TeacherOut, status_code=status.HTTP_201_CREATED)
async def register_user(payload: RegisterIn):
    email = payload.email

    existing = await Teacher.find_one(Teacher.email == email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(payload.password)
    teacher = Teacher(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=email,
        password=hashed_pw,     
        role="teacher",         
        section=payload.section,
    )
    await teacher.insert()

    return TeacherOut(
        id=str(teacher.id),
        first_name=teacher.first_name,
        last_name=teacher.last_name,
        email=teacher.email,
        section=teacher.section,
        role=teacher.role,
    )

@router.post("/login", response_model=TokenOut)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await Teacher.find_one(Teacher.email == form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token_data = {"sub": str(user.id), "role": user.role}
    access_token = create_access_token(data=token_data)
    return TokenOut(access_token=access_token)
