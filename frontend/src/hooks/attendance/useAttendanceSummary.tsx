import { AttendanceLogListView } from "@/dto/attendanceLogsView";

import { AttendanceLog } from "@/domain/attendanceLog";
import { getAttendanceLogs } from "@/services/attendanceLogsService";
import { useCallback, useState } from "react";

export function useAttendanceSummary(date: string | null) {
  const [attendanceSummary, setAttendanceSummary] =
    useState<AttendanceLogListView | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAttendanceSummary = useCallback(
    async (section: string) => {
      setLoading(true);
      console.log("Fetching attendanceLogs");
      const result = await getAttendanceLogs(section, date);

      if ("error" in result) {
        setError(result.error.message);
      } else {
        // Convert from snake_case to camelCase
        console.log(result.data);
        const dataView: AttendanceLogListView = {
          attendanceLogs: result.data.student_summaries.map(
            (log: AttendanceLog) => ({
              studentId: log.student_id,
              studentName: log.student_name,
              section: log.section,
              totalLates: log.total_lates,
              totalAbsences: log.total_absences,
            })
          ),
        };
        setAttendanceSummary(dataView);
      }
      setLoading(false);
    },
    [date]
  );

  return {
    getAttendanceSummary,
    attendanceLogs: attendanceSummary,
    loading,
    error,
  };
}
