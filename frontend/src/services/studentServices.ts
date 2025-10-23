import { StudentApi } from "@/domain/student";
import { StudentForm } from "@/dto/studentForm";
import { ApiError } from "@/utils/apiError";
import { err, ok, Result } from "@/utils/result";
import axios from "axios";

export const getStudents = async (
  token: string,
): Promise<Result<StudentApi[]>> => {
  try {
    const response = await axios.get(
      `https://attendance-monitoring-system-65w1.onrender.com/students?token=${token}`,
    );

    if (!response.data) {
      const error: ApiError = {
        code: response.status,
        message: response.statusText,
        details: "[Error] (get) <getStudent()>",
      };

      console.error(error);

      return err(error);
    }

    const data: StudentApi[] = response.data;

    return ok(data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const axError = {
        code: error.response.status,
        message: error.response.statusText,
        details: "[Error] (get) <getStudent()>",
      };

      console.error(axError);

      return err(axError);
    }

    const localErr = {
      code: 500,
      message:
        error instanceof Error ? error.message : "An unknown error occured",
      details: "[Error] (get) <getStudent()>",
    };

    console.error(localErr);

    return err(localErr);
  }
};

export const getStudent = async (
  id: string,
  token: string,
): Promise<Result<StudentApi>> => {
  try {
    const response = await axios.get(
      `https://attendance-monitoring-system-65w1.onrender.com/students/${id}?token=${token}`,
    );

    if (!response.data) {
      const error: ApiError = {
        code: response.status,
        message: response.statusText,
        details: "[Error] (get) <getStudent()>",
      };

      console.error(error);

      return err(error);
    }

    const data: StudentApi = response.data;

    return ok(data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const axError = {
        code: error.response.status,
        message: error.response.statusText,
        details: "[Error] (get) <getStudent()>",
      };

      console.error(axError);

      return err(axError);
    }

    const localErr = {
      code: 500,
      message:
        error instanceof Error ? error.message : "An unknown error occured",
      details: "[Error] (get) <getStudent()>",
    };

    console.error(localErr);

    return err(localErr);
  }
};

export const postStudent = async (
  token: string,
  form: StudentForm,
): Promise<Result<StudentApi>> => {
  try {
    const response = await axios.post(
      `https://attendance-monitoring-system-65w1.onrender.com/students?token=${token}`,
      form,
    );

    if (!response.data) {
      const error: ApiError = {
        code: response.status,
        message: response.statusText,
        details: "[Error] (post) <postStudent()>",
      };

      console.error(error);

      return err(error);
    }

    const data: StudentApi = response.data;

    return ok(data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const axError = {
        code: error.response.status,
        message: error.response.statusText,
        details: "[Error] (post) <postStudent()>",
      };

      console.error(axError);

      return err(axError);
    }

    const localErr = {
      code: 500,
      message:
        error instanceof Error ? error.message : "An unknown error occured",
      details: "[Error] (post) <postStudent()>",
    };

    console.error(localErr);

    return err(localErr);
  }
};
