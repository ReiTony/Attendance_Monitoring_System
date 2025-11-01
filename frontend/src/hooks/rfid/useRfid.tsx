import { AttendanceRecordView } from "@/dto/attendanceRecord";
import { postRfid } from "@/services/rfidServices";
import { useState } from "react";

export function useRfid() {
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [attendanceRecord, setAttendanceRecord] =
    useState<AttendanceRecordView | null>(null);
  const [error, setError] = useState<string | undefined | null>(null);

  const record = async (rfid: string) => {
    setLoading(true);

    const result = await postRfid(rfid);

    if ("error" in result) {
      setError(result.error.message);
    } else if ("detail" in result.data) {
      console.log("[HOOK] Detail: ", result.data);
      setError(result.data.detail);
    } else if ("_id" in result.data) {
      console.log("[HOOK] Doc: ", result.data);
      const dataView: AttendanceRecordView = {
        id: result.data._id ?? "",
        studentId: result.data.student_id ?? "",
        studentName: result.data.student_name ?? "",
        section: result.data.section ?? "",
        subject: result.data.subject ?? "",
        lessonDate: result.data.lesson_date ?? "",
        timeIn: result.data.time_in,
        timeOut: result.data.time_out,
        totalBreakSeconds: result.data.total_break_seconds,
        breaks: result.data.breaks.map((breakItem) => ({
          start: breakItem.start ?? "",
          end: breakItem.end ?? "",
          durationSeconds: breakItem.duration_seconds,
          duration: breakItem.duration ?? "",
        })),
        status: result.data.status ?? "",
        late: result.data.late,
        leftEarly: result.data.left_early,
        remarks: result.data.remarks ?? "",
        fromDevice: result.data.from_device ?? "",
        createdAt: result.data.created_at ?? "",
        updatedAt: result.data.updated_at ?? "",
      };
      setAttendanceRecord(dataView);
      setSuccess("Attendance recorded");
    }

    setLoading(false);
  };

  return {
    record,
    attendanceRecord,
    success,
    loading,
    error,
  };
}
