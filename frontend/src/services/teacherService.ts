import { Teacher } from "@/domain/teacher";
import { TeacherRegisterForm } from "@/dto/teacherRegisterForm";
import { ApiError } from "@/utils/apiError";
import { err, ok, Result } from "@/utils/result";
import axios from "axios";

export const authLogin = async (): Promise<Result<Teacher>> => {
  try {
    const response = await axios.get(
      `https://attendance-monitoring-system-65w1.onrender.com/teacher/login`
    );

    if (!response.data) {
      const error: ApiError = {
        code: response.status,
        message: response.statusText,
        details: "[Error] (get) <authLogin()>",
      };

      console.error(error);

      return err(error);
    }

    return ok(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const axError = {
        code: error.response.status,
        message: error.response.statusText,
        details: "[Error] (get) <authLogin()>",
      };

      console.error(axError);

      return err(axError);
    }

    const localErr = {
      code: 500,
      message:
        error instanceof Error ? error.message : "An unknown error occured",
      details: "[Error] (get) <authLogin()>",
    };

    console.error(localErr);

    return err(localErr);
  }
};

export const authRegister = async (
  form: TeacherRegisterForm
): Promise<Result<Teacher>> => {
  try {
    const response = await axios.post(
      `https://attendance-monitoring-system-65w1.onrender.com/teacher/register`,
      form
    );

    return ok(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const axError = {
        code: error.response.status,
        message: error.response.statusText,
        details: "[Error] (post) <authRegister()>",
      };

      console.error(axError);

      return err(axError);
    }

    const localErr = {
      code: 500,
      message:
        error instanceof Error ? error.message : "An unknown error occured",
      details: "[Error] (post) <authRegister()>",
    };

    console.error(localErr);

    return err(localErr);
  }
};
