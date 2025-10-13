# connection.py
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from decouple import config
import asyncio

MONGO_URI = config("MONGO_URI")

client = AsyncIOMotorClient(MONGO_URI)
db = client.attendance_system

def get_db():
    return db

async def init_db():
    from models.user import Teacher, Student
    from models.attendance import Attendance
    from models.class_schedule import Schedule

    await init_beanie(
        database=db,
        document_models=[Teacher, Student, Attendance, Schedule]
    )
