from fastapi import Depends, HTTPException, status
from jose import jwt, JWTError
from decouple import config
from models.user import Teacher
SECRET_KEY = config("SECRET_KEY", default="supersecretkey")
ALGORITHM = "HS256"

async def get_current_user(token: str) -> Teacher:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await Teacher.get(user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="Inactive user")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def role_required(*roles: str):
    async def checker(current_user: Teacher = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return current_user
    return checker
