from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from pymongo import MongoClient
from dotenv import load_dotenv

from api.auth_route import router as auth_route
from api.students_route import router as students_route
from api.attendance_route import router as attendance_route
from api.class_report import router as class_report_route
from api.edit_details_route import router as edit_details_route
from api.schedule_route import router as schedule_route
load_dotenv()

from db.connection import init_db

MONGODB_URI = os.getenv(
    "MONGODB_URI"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up and connecting to the database...")
    await init_db()
    yield
    print("Shutting down...")

app = FastAPI(
    title="Attendance Monitoring System",
    description="API for Attendance Monitoring System",
    version="1.0.0",
    lifespan=lifespan
)
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_route, prefix="/teacher", tags=["Teacher"])
app.include_router(students_route, prefix="/students", tags=["Students"])
app.include_router(attendance_route, prefix="/attendance", tags=["Attendance"])
app.include_router(class_report_route, prefix="/reports", tags=["Reports"])
app.include_router(edit_details_route, prefix="/edit", tags=["Edit Details"])
app.include_router(schedule_route, prefix="/schedule", tags=["Schedule"])
@app.on_event("startup")
def startup_event():
    client = MongoClient(MONGODB_URI)
    app.state.mongo_client = client

@app.on_event("shutdown")
def shutdown_event():
    client = getattr(app.state, "mongo_client", None)
    if client:
        client.close()

@app.get("/")
async def root():
    return {"message": "Server is running"}