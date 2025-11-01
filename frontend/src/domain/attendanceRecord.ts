export type AttendanceRecordApi = {
  _id: string | null;
  student_id: string | null;
  student_name: string | null;
  section: string | null;
  subject: string | null;
  lesson_date: string | null;
  time_in: string | null;
  time_out: string | null;
  total_break_seconds: number;
  breaks: {
    start: string | null;
    end: string | null;
    duration_seconds: number;
    duration: string | null;
  }[];
  status: string | null;
  late: boolean;
  left_early: boolean;
  remarks: string | null;
  from_device: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type AttendanceRecordListApi = {
  records: AttendanceRecordApi[];
};
