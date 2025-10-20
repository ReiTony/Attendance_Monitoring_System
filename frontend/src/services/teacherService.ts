import { Teacher, TeacherWithAccessToken } from "@/domain/teacher";
import { TeacherLoginForm } from "@/dto/teacherLoginForm";
import { TeacherRegisterForm } from "@/dto/teacherRegisterForm";
import { ApiError } from "@/utils/apiError";
import { err, ok, Result } from "@/utils/result";
import axios from "axios";

const TEACHER_CACHE_KEY = "cached_teacher_data";

export const getCachedTeacher = (): TeacherWithAccessToken | null => {
  if (typeof window === "undefined") return null;

  const cachedData = localStorage.getItem(TEACHER_CACHE_KEY);
  return cachedData ? JSON.parse(cachedData) : null;
};

export const cacheTeacher = (
  teacherWithAccessToken: TeacherWithAccessToken
): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    TEACHER_CACHE_KEY,
    JSON.stringify(teacherWithAccessToken)
  );
};

export const clearTeacherCache = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TEACHER_CACHE_KEY);
};

export const authLogin = async (
  form: TeacherLoginForm
): Promise<Result<TeacherWithAccessToken>> => {
  try {
    const response = await axios.post(
      `https://attendance-monitoring-system-65w1.onrender.com/teacher/login`,
      form
    );

    if (!response.data) {
      const error: ApiError = {
        code: response.status,
        message: response.statusText,
        details: "[Error] (post) <authLogin()>",
      };

      console.error(error);

      return err(error);
    }

    const teacherWithAccessToken: TeacherWithAccessToken = response.data;
    cacheTeacher(teacherWithAccessToken);

    return ok(teacherWithAccessToken);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const axError = {
        code: error.response.status,
        message: error.response.statusText,
        details: "[Error] (post) <authLogin()>",
      };

      console.error(axError);

      return err(axError);
    }

    const localErr = {
      code: 500,
      message:
        error instanceof Error ? error.message : "An unknown error occured",
      details: "[Error] (post) <authLogin()>",
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

    if (!response.data) {
      const error: ApiError = {
        code: response.status,
        message: response.statusText,
        details: "[Error] (post) <authRegister()>",
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
