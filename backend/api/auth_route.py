from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from beanie import PydanticObjectId
from datetime import timedelta
import logging

from models.user import User
from core.security import hash_password, verify_password, create_access_token

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('auth_route')
router = APIRouter()

#Registration
@router.post("/register")
async def register_user(name: str, email: str, password: str, role: str, section: str | None = None):
    existing_user = await User.find_one(User.email == email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(password)
    user = User(name=name, email=email, password=hashed_pw, role=role, section=section)
    await user.insert()
    return {"message": "User registered successfully"}

#Login
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await User.find_one(User.email == form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token_data = {"sub": str(user.id), "role": user.role}
    access_token = create_access_token(data=token_data)
    return {"access_token": access_token, "token_type": "bearer"}
