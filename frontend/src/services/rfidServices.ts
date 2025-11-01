import { AttendanceRecordApi } from "@/domain/attendanceRecord";
import { ApiError } from "@/utils/apiError";
import { err, ok, Result } from "@/utils/result";
import axios from "axios";

export const postRfid = async (
  rfid: string
): Promise<Result<AttendanceRecordApi | { detail: string }>> => {
  try {
    const result = await axios.post(
      `https://attendance-monitoring-system-65w1.onrender.com/attendance/rfid`,
      null,
      {
        params: {
          rfid_uid: rfid,
        },
      }
    );

    if (result.data.detail) {
      console.log("Detail: ", result.data);
      return ok(result.data as { detail: string });
    }

    if (result.data.doc) {
      console.log("Doc: ", result.data);
      return ok(result.data.doc as AttendanceRecordApi);
    }

    console.log("All: ", result.data);
    return ok(result.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Deprecated
      if (error.response.status === 400) {
        const newError: ApiError = {
          code: error.response.status,
          message:
            "No class is currently in session for section 'ICT12A' at this time.",
          details: "[Error] (post) <postRfid()>",
        };

        console.error(newError);

        return err(newError);
      }

      if (error.response.status === 404) {
        const newError: ApiError = {
          code: error.response.status,
          message: error.response.data.detail,
          details: `[Error: ${404}] (post) <postRfid()>`,
        };

        console.error(newError);

        return err(newError);
      }

      const axError = {
        code: error.response.status,
        message: error.response.statusText,
        details: `[Error: ${error.response.status}] (post) <postRfid()>`,
      };

      console.error(axError);

      return err(axError);
    }

    const localErr = {
      code: 500,
      message:
        error instanceof Error ? error.message : "An unknown error occured",
      details: `[Error: ${500}] (post) <postRfid()>`,
    };

    console.error(localErr);

    return err(localErr);
  }
};
