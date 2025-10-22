export type ClassScheduleApi = {
  _id: string;
  section: string;
  subject: string;
  teacher_name: string;
  day: string;
  start_time: string;
  end_time: string;
  room: string;
  created_at: string;
};

export type ClassScheduleListApi = ClassScheduleApi[];
