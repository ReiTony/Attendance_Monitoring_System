export type AttendanceRecordsApi = {
  records: {
    _id: string;
    student_id: string;
    student_name: string;
    section: string;
    subject: string;
    lesson_date: string;
    time_in: string;
    time_out: string;
    total_break_seconds: number;
    breaks: {
      start: string;
      end: string;
      duration_seconds: number;
      duration: string;
    }[];
    status: string;
    late: boolean;
    left_early: boolean;
    remarks: string;
    from_device: string;
    created_at: string;
    updated_at: string;
  }[];
};
