import { AttendanceLogListView } from "@/dto/attendanceLogsView";
import { AttendanceLog } from "@/domain/attendanceLog";
import { getAttendanceLogs } from "@/services/attendanceLogsService";
import { useCallback, useEffect, useState } from "react";
import { useTeacher } from "@/hooks/useTeacher";

export function useAttendanceLogs() {
  const { teacherWithAccessToken } = useTeacher();
  const [attendanceLogs, setAttendanceLogs] =
    useState<AttendanceLogListView | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    if (!teacherWithAccessToken) return;
    console.log("Fetching attendanceLogs");
    const result = await getAttendanceLogs(
      teacherWithAccessToken.teacher.section,
    );

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
          }),
        ),
      };
      setAttendanceLogs(dataView);
    }
    setLoading(false);
  }, [teacherWithAccessToken]);

  useEffect(() => {
    if (!attendanceLogs) {
      load();
    }
  }, [attendanceLogs, load]);

  return {
    attendanceLogs,
    loading,
    error,
  };
}
