export type AttendanceLogView = {
  studentId: string;
  studentName: string;
  section: string;
  totalLates: number;
  totalAbsences: number;
};

export type AttendanceLogListView = {
  attendanceLogs: AttendanceLogView[];
};
