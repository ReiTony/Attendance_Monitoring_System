from beanie import Document
from pydantic import Field, EmailStr
from typing import Literal, Optional
from datetime import datetime

class User(Document):
    name: str
    email: EmailStr
    password: str  
    role: Literal["teacher", "student"]
    section: Optional[str] = None  
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"  
