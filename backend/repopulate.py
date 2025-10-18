import asyncio
from datetime import time, date, datetime, timezone, timedelta
from models.class_schedule import Schedule
from db.connection import init_db

# THIS DATA IS NOW VERIFIED 100% AGAINST THE IMAGE
correct_schedules_data = [
    # MONDAY
    {"day": "Mon", "subject": "SP-ICT6 (WebDev)", "start_time": time(7, 30), "end_time": time(8, 30)},
    {"day": "Mon", "subject": "SP-ICT4 (Animation)", "start_time": time(9, 30), "end_time": time(10, 30)},
    {"day": "Mon", "subject": "CSPEH3 (P.E)", "start_time": time(11, 0), "end_time": time(12, 0)},
    {"day": "Mon", "subject": "CTENTRE1 (Enrep)", "start_time": time(12, 30), "end_time": time(14, 0)},
    {"day": "Mon", "subject": "CSFL01 (國語)", "start_time": time(14, 30), "end_time": time(16, 0)},
    # TUESDAY
    {"day": "Tue", "subject": "CSCLE3", "start_time": time(7, 0), "end_time": time(8, 0)},
    {"day": "Tue", "subject": "CSSOC2 (PerDev)", "start_time": time(8, 0), "end_time": time(9, 0)},
    {"day": "Tue", "subject": "SP-ICT5 (CSS)", "start_time": time(9, 30), "end_time": time(11, 0)},
    {"day": "Tue", "subject": "CTDRL2 (Research)", "start_time": time(12, 0), "end_time": time(13, 30)},
    {"day": "Tue", "subject": "CSENG2", "start_time": time(14, 0), "end_time": time(16, 0)},
    # WEDNESDAY
    {"day": "Wed", "subject": "SP-ICT6 (WebDev)", "start_time": time(7, 0), "end_time": time(8, 0)},
    {"day": "Wed", "subject": "SP-ICT4 (Animation)", "start_time": time(9, 0), "end_time": time(10, 0)},
    {"day": "Wed", "subject": "CSPEH3 (P.E)", "start_time": time(10, 30), "end_time": time(11, 30)},
    {"day": "Wed", "subject": "CTENTRE1 (Enrep)", "start_time": time(12, 30), "end_time": time(13, 30)},
    # THIS LINE IS NOW CORRECT
    {"day": "Wed", "subject": "CSFL01 (國語)", "start_time": time(14, 30), "end_time": time(17, 30)},
    # THURSDAY
    {"day": "Thu", "subject": "CSCLE3", "start_time": time(7, 0), "end_time": time(8, 0)},
    {"day": "Thu", "subject": "CSSOC2 (PerDev)", "start_time": time(8, 0), "end_time": time(9, 0)},
    {"day": "Thu", "subject": "SP-ICT5 (CSS)", "start_time": time(10, 0), "end_time": time(11, 0)},
    {"day": "Thu", "subject": "CTDRL2 (Research)", "start_time": time(12, 0), "end_time": time(13, 30)},
    {"day": "Thu", "subject": "CSENG2", "start_time": time(14, 30), "end_time": time(16, 0)},
    # FRIDAY - test
    {"day": "Fri", "subject": "Free Period1", "start_time": time(7, 0), "end_time": time(10, 0)},
    {"day": "Fri", "subject": "Free Period2", "start_time": time(14, 30), "end_time": time(14, 50)},
    {"day": "Fri", "subject": "Free Period3", "start_time": time(14, 55), "end_time": time(15, 15)},

]

async def repopulate_data():
    print("--- Starting Schedule Repopulation Script ---")
    await init_db()
    print("Deleting all existing schedules...")
    await Schedule.delete_all()
    print("Preparing new schedule objects...")
    local_tz = timezone(timedelta(hours=8))
    placeholder_date = date(1970, 1, 1)
    
    schedule_objects_to_insert = []
    for sched_data in correct_schedules_data:
        naive_start = datetime.combine(placeholder_date, sched_data["start_time"])
        naive_end = datetime.combine(placeholder_date, sched_data["end_time"])
        aware_start = naive_start.replace(tzinfo=local_tz)
        aware_end = naive_end.replace(tzinfo=local_tz)
        schedule_doc = Schedule(
            section="ICT12A", teacher_name="TBA", room="211",
            day=sched_data["day"], subject=sched_data["subject"],
            start_time=aware_start, end_time=aware_end,
        )
        schedule_objects_to_insert.append(schedule_doc)
    
    print("Inserting new documents...")
    await Schedule.insert_many(schedule_objects_to_insert)
    print("--- Repopulation Complete! ---")

if __name__ == "__main__":
    asyncio.run(repopulate_data())