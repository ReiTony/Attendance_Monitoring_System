import { AttendanceRecordListApi } from "@/domain/attendanceRecord";
import { ApiError } from "@/utils/apiError";
import { err, ok, Result } from "@/utils/result";
import axios from "axios";

export const getAttendanceRecords = async (
  studentId: string,
  subject: string | null,
  date: string | null
): Promise<Result<AttendanceRecordListApi>> => {
  try {
    const response = await axios.get(
      `https://attendance-monitoring-system-65w1.onrender.com/attendance/records`,
      {
        params: {
          student_id: studentId,
          subject,
          date,
        },
      }
    );

    if (!response.data) {
      const error: ApiError = {
        code: response.status,
        message: response.statusText,
        details: "[Error] (get) <getAttendanceRecords()>",
      };

      console.error(error);

      return err(error);
    }

    const data: AttendanceRecordListApi = response.data;

    console.log(data);

    return ok(data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const axError = {
        code: error.response.status,
        message: error.response.statusText,
        details: "[Error] (get) <getAttendanceRecords()>",
      };

      console.error(axError);

      return err(axError);
    }

    const localErr = {
      code: 500,
      message:
        error instanceof Error ? error.message : "An unknown error occured",
      details: "[Error] (get) <getAttendanceRecords()>",
    };

    console.error(localErr);

    return err(localErr);
  }
};
