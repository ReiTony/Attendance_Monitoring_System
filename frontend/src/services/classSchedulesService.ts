import { ClassScheduleListApi } from "@/domain/classSchedules";
import { ApiError } from "@/utils/apiError";
import { err, ok, Result } from "@/utils/result";
import axios from "axios";

export const getClassSchedules = async (): Promise<
  Result<ClassScheduleListApi>
> => {
  try {
    const response = await axios.get(
      `https://attendance-monitoring-system-65w1.onrender.com/schedule/class-schedules`,
    );

    if (!response.data) {
      const error: ApiError = {
        code: response.status,
        message: response.statusText,
        details: "[Error] (get) <getClassSchedules()>",
      };

      console.error(error);

      return err(error);
    }

    const data: ClassScheduleListApi = response.data;

    return ok(data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const axError = {
        code: error.response.status,
        message: error.response.statusText,
        details: "[Error] (get) <getClassSchedules()>",
      };

      console.error(axError);

      return err(axError);
    }

    const localErr = {
      code: 500,
      message:
        error instanceof Error ? error.message : "An unknown error occured",
      details: "[Error] (get) <getClassSchedules()>",
    };

    console.error(localErr);

    return err(localErr);
  }
};
