export type AttendanceLog = {
  student_id: string;
  student_name: string;
  section: string;
  total_lates: number;
  total_absences: number;
};

export type AttendanceLogApi = {
  report_details: string;
  student_summaries: AttendanceLog[];
};
