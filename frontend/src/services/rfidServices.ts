import { ApiError } from "@/utils/apiError";
import { err, ok, Result } from "@/utils/result";
import axios from "axios";

export const postRfid = async (rfid: string): Promise<Result<void>> => {
  try {
    await axios.post(
      `https://attendance-monitoring-system-65w1.onrender.com/attendance/rfid?rfid_uid=${rfid}`
    );

    return ok(undefined);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 400) {
        const newError: ApiError = {
          code: error.response.status,
          message:
            "No class is currently in session for section 'ICT12A' at this time.",
          details: "[Error] (post) <postRfid()>",
        };

        return err(newError);
      }

      const axError = {
        code: error.response.status,
        message: error.response.statusText,
        details: "[Error] (post) <postRfid()>",
      };

      console.error(axError);

      return err(axError);
    }

    const localErr = {
      code: 500,
      message:
        error instanceof Error ? error.message : "An unknown error occured",
      details: "[Error] (post) <postRfid()>",
    };

    console.error(localErr);

    return err(localErr);
  }
};
