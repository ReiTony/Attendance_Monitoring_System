from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os

from api.auth_route import router as auth_route
#from api.students_route import router as students_route
#from api.attendance_route import router as attendance_route

from db.connection import init_db

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

app.include_router(auth_route, prefix="/auth", tags=["Authentication"])
#app.include_router(students_route, prefix="/students", tags=["Students"])
#app.include_router(attendance_route, prefix="/attendance", tags=["Attendance"])

@app.get("/")
async def root():
    return {"message": "Server is running"}