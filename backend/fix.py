from datetime import time
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models.class_schedule import Schedule

async def fix_schedules():
    # Initialize MongoDB connection (adjust your connection string)
    client = AsyncIOMotorClient("mongodb://localhost:27017")  # Update with your MongoDB URI
    database = client["your_database_name"]  # Update with your database name
    
    # Initialize Beanie
    await init_beanie(database=database, document_models=[Schedule])
    
    # Delete old schedules for ICT12A
    print("Deleting old schedules...")
    result = await Schedule.find(Schedule.section == "ICT12A").delete()
    print(f"Deleted {result.deleted_count} old schedules")
    
    # Re-insert with correct time objects (Beijing local time - UTC+8)
    schedules = [
        # Monday
        {"section": "ICT12A", "subject": "SP-ICT6 (WebDev)", "teacher_name": "TBA", "day": "Mon", "start_time": time(7, 30), "end_time": time(8, 30), "room": "211"},
        {"section": "ICT12A", "subject": "SP-ICT4 (Animation)", "teacher_name": "TBA", "day": "Mon", "start_time": time(9, 30), "end_time": time(10, 30), "room": "211"},
        {"section": "ICT12A", "subject": "CSPEH3 (P.E)", "teacher_name": "TBA", "day": "Mon", "start_time": time(11, 0), "end_time": time(12, 0), "room": "211"},
        {"section": "ICT12A", "subject": "CTENTRE1 (Enrep)", "teacher_name": "TBA", "day": "Mon", "start_time": time(12, 30), "end_time": time(14, 0), "room": "211"},
        {"section": "ICT12A", "subject": "CSFL01 (國語)", "teacher_name": "TBA", "day": "Mon", "start_time": time(14, 30), "end_time": time(16, 0), "room": "211"},
        
        # Tuesday
        {"section": "ICT12A", "subject": "CSCLE3", "teacher_name": "TBA", "day": "Tue", "start_time": time(7, 0), "end_time": time(8, 0), "room": "211"},
        {"section": "ICT12A", "subject": "CSSOC2 (PerDev)", "teacher_name": "TBA", "day": "Tue", "start_time": time(8, 0), "end_time": time(9, 0), "room": "211"},
        {"section": "ICT12A", "subject": "SP-ICT5 (CSS)", "teacher_name": "TBA", "day": "Tue", "start_time": time(9, 30), "end_time": time(11, 0), "room": "211"},
        {"section": "ICT12A", "subject": "CTDRL2 (Research)", "teacher_name": "TBA", "day": "Tue", "start_time": time(12, 0), "end_time": time(13, 30), "room": "211"},
        {"section": "ICT12A", "subject": "CSENG2", "teacher_name": "TBA", "day": "Tue", "start_time": time(14, 0), "end_time": time(16, 0), "room": "211"},
        
        # Wednesday
        {"section": "ICT12A", "subject": "SP-ICT6 (WebDev)", "teacher_name": "TBA", "day": "Wed", "start_time": time(7, 0), "end_time": time(8, 0), "room": "211"},
        {"section": "ICT12A", "subject": "SP-ICT4 (Animation)", "teacher_name": "TBA", "day": "Wed", "start_time": time(9, 0), "end_time": time(10, 0), "room": "211"},
        {"section": "ICT12A", "subject": "CSPEH3 (P.E)", "teacher_name": "TBA", "day": "Wed", "start_time": time(10, 30), "end_time": time(11, 30), "room": "211"},
        {"section": "ICT12A", "subject": "CTENTRE1 (Enrep)", "teacher_name": "TBA", "day": "Wed", "start_time": time(12, 30), "end_time": time(13, 30), "room": "211"},
        {"section": "ICT12A", "subject": "CSFL01 (國語)", "teacher_name": "TBA", "day": "Wed", "start_time": time(14, 30), "end_time": time(16, 30), "room": "211"},
        
        # Thursday
        {"section": "ICT12A", "subject": "CSCLE3", "teacher_name": "TBA", "day": "Thu", "start_time": time(7, 0), "end_time": time(8, 0), "room": "211"},
        {"section": "ICT12A", "subject": "CSSOC2 (PerDev)", "teacher_name": "TBA", "day": "Thu", "start_time": time(8, 0), "end_time": time(9, 0), "room": "211"},
        {"section": "ICT12A", "subject": "SP-ICT5 (CSS)", "teacher_name": "TBA", "day": "Thu", "start_time": time(10, 0), "end_time": time(11, 0), "room": "211"},
        {"section": "ICT12A", "subject": "CTDRL2 (Research)", "teacher_name": "TBA", "day": "Thu", "start_time": time(12, 0), "end_time": time(13, 30), "room": "211"},
        {"section": "ICT12A", "subject": "CSENG2", "teacher_name": "TBA", "day": "Thu", "start_time": time(14, 30), "end_time": time(16, 0), "room": "211"},

        # FRIDAY - test
        {"day": "Fri", "subject": "Free Period1", "start_time": time(7, 0), "end_time": time(10, 0)},
        {"day": "Fri", "subject": "Free Period2", "start_time": time(14, 30), "end_time": time(14, 50)},
        {"day": "Fri", "subject": "Free Period3", "start_time": time(14, 55), "end_time": time(15, 15)},
    ]
    
    print("Inserting new schedules...")
    for sched_data in schedules:
        schedule = Schedule(**sched_data)
        await schedule.insert()
        print(f"✓ Inserted: {schedule.day} - {schedule.subject} ({schedule.start_time} - {schedule.end_time})")
    
    print(f"\n✅ Successfully inserted {len(schedules)} schedules!")

if __name__ == "__main__":
    import asyncio
    asyncio.run(fix_schedules())