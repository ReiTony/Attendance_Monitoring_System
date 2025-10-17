from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import logging

from models.user import Teacher
from core.security import hash_password, verify_password, create_access_token, decode_access_token

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

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    teacher: TeacherOut

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/teacher/login")

async def get_current_teacher(token: str = Depends(oauth2_scheme)) -> Teacher:
    try:
        payload = decode_access_token(token) 
        user_id: Optional[str] = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        teacher = await Teacher.get(user_id)
        if not teacher:
            raise HTTPException(status_code=401, detail="User not found")

        return teacher
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Could not validate credentials")



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

@router.post("/login", response_model=LoginResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await Teacher.find_one(Teacher.email == form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token_data = {"sub": str(user.id), "role": user.role}
    access_token = create_access_token(data=token_data)

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        teacher=TeacherOut(
            id=str(user.id),
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            section=user.section,
            role=user.role,
        ),
    )


@router.get("/me", response_model=TeacherOut)
async def get_me(current: Teacher = Depends(get_current_teacher)):
    return TeacherOut(
        id=str(current.id),
        first_name=current.first_name,
        last_name=current.last_name,
        email=current.email,
        section=current.section,
        role=current.role,
    )