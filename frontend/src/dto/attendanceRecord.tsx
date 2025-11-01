export type AttendanceRecordView = {
  id: string;
  studentId: string;
  studentName: string;
  section: string;
  subject: string;
  lessonDate: string;
  timeIn: string | null;
  timeOut: string | null;
  totalBreakSeconds: number;
  breaks: {
    start: string;
    end: string;
    durationSeconds: number;
    duration: string;
  }[];
  status: string;
  late: boolean;
  leftEarly: boolean;
  remarks: string;
  fromDevice: string;
  createdAt: string;
  updatedAt: string;
};

export type AttendanceRecordListView = {
  records: AttendanceRecordView[];
};
