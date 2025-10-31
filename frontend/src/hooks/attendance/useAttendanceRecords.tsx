import { useCallback, useState } from "react";
import { getAttendanceRecords } from "@/services/attendanceRecordsService";
import { AttendanceRecordListView } from "@/dto/attendanceRecord";

export function useAttendanceRecords() {
  const [attendanceRecords, setAttendanceRecords] =
    useState<AttendanceRecordListView | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAttendanceSummary = useCallback(
    async (studentId: string, subject: string | null, date: string | null) => {
      setLoading(true);
      console.log("Fetching Student Attendance Records");
      const result = await getAttendanceRecords(studentId, subject, date);

      if ("error" in result) {
        setError(result.error.message);
      } else {
        // Convert from snake_case to camelCase
        console.log(result.data);
        const dataView: AttendanceRecordListView = {
          records: result.data.records.map((record) => ({
            id: record._id,
            studentId: record.student_id,
            studentName: record.student_name,
            section: record.section,
            subject: record.subject,
            lessonDate: record.lesson_date,
            timeIn: record.time_in,
            timeOut: record.time_out,
            totalBreakSeconds: record.total_break_seconds,
            breaks: record.breaks.map((breakItem) => ({
              start: breakItem.start,
              end: breakItem.end,
              durationSeconds: breakItem.duration_seconds,
              duration: breakItem.duration,
            })),
            status: record.status,
            late: record.late,
            leftEarly: record.left_early,
            remarks: record.remarks,
            fromDevice: record.from_device,
            createdAt: record.created_at,
            updatedAt: record.updated_at,
          })),
        };
        setAttendanceRecords(dataView);
      }
      setLoading(false);
    },
    []
  );

  return {
    getAttendanceSummary,
    attendanceRecords,
    loading,
    error,
  };
}
