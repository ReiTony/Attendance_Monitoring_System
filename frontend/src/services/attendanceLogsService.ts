import { AttendanceLogApi } from "@/domain/attendanceLog";
import { ApiError } from "@/utils/apiError";
import { err, ok, Result } from "@/utils/result";
import axios from "axios";

export const getAttendanceLogs = async (
  section: string,
  date: string | null = null
): Promise<Result<AttendanceLogApi>> => {
  try {
    const response = await axios.get(
      `https://attendance-monitoring-system-65w1.onrender.com/reports/attendance-summary`,
      {
        params: {
          section,
          lesson_date: date,
        },
      }
    );

    if (!response.data) {
      const error: ApiError = {
        code: response.status,
        message: response.statusText,
        details: "[Error] (get) <getAttendanceLogs()>",
      };

      console.error(error);

      return err(error);
    }

    const data: AttendanceLogApi = response.data;

    return ok(data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const axError = {
        code: error.response.status,
        message: error.response.statusText,
        details: "[Error] (get) <getAttendanceLogs()>",
      };

      console.error(axError);

      return err(axError);
    }

    const localErr = {
      code: 500,
      message:
        error instanceof Error ? error.message : "An unknown error occured",
      details: "[Error] (get) <getAttendanceLogs()>",
    };

    console.error(localErr);

    return err(localErr);
  }
};
