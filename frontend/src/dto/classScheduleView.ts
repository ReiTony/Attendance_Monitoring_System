export type ClassScheduleView = {
  id: string;
  section: string;
  subject: string;
  teacherName: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  createdAt: string;
};

export type ClassScheduleListView = ClassScheduleView[];
