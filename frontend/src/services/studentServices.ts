import { StudentApi } from "@/domain/student";
import { StudentForm, StudentUpdateForm } from "@/dto/studentForm";
import { ApiError } from "@/utils/apiError";
import { err, ok, Result } from "@/utils/result";
import axios from "axios";

export const getStudents = async (
  section: string,
  token: string
): Promise<Result<StudentApi[]>> => {
  try {
    const response = await axios.get(
      `https://attendance-monitoring-system-65w1.onrender.com/students?token=${token}&section=${section}`
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
  token: string
): Promise<Result<StudentApi>> => {
  try {
    const response = await axios.get(
      `https://attendance-monitoring-system-65w1.onrender.com/students/${id}?token=${token}`
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
  form: StudentForm
): Promise<Result<StudentApi>> => {
  try {
    const response = await axios.post(
      `https://attendance-monitoring-system-65w1.onrender.com/students/create?token=${token}`,
      form
    );

    if (!response.data) {
      if (response.status === 400) {
        const speErr: ApiError = {
          code: response.status,
          message: "Seat is taken",
          details: "[Error] (post) <postStudent()>",
        };

        console.error(speErr);

        return err(speErr);
      }
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
      if (error.response.status === 400) {
        const speErr: ApiError = {
          code: error.response.status,
          message: error.response.data.detail,
          details: "[Error] (post) <postStudent()>",
        };

        console.error(speErr);

        return err(speErr);
      }
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

export const putStudent = async (
  id: string,
  form: StudentUpdateForm,
  token?: string
): Promise<Result<StudentApi>> => {
  try {
    const url = token
      ? `https://attendance-monitoring-system-65w1.onrender.com/edit/students/${id}?token=${token}`
      : `https://attendance-monitoring-system-65w1.onrender.com/edit/students/${id}`;

    const response = await axios.put(url, form);

    if (!response.data) {
      const error: ApiError = {
        code: response.status,
        message: response.statusText,
        details: "[Error] (post) <putStudent()>",
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
        details: "[Error] (post) <putStudent()>",
      };

      console.error(axError);

      return err(axError);
    }

    const localErr = {
      code: 500,
      message:
        error instanceof Error ? error.message : "An unknown error occured",
      details: "[Error] (post) <putStudent()>",
    };

    console.error(localErr);

    return err(localErr);
  }
};

export const deleteStudent = async (
  id: string,
  token: string
): Promise<Result<void>> => {
  try {
    await axios.delete(
      `https://attendance-monitoring-system-65w1.onrender.com/students/${id}?token=${token}`
    );

    return ok(undefined);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const axError = {
        code: error.response.status,
        message: error.response.statusText,
        details: "[Axios Error] (post) <deleteStudent()>",
      };

      console.error(axError);

      return err(axError);
    }

    const localErr = {
      code: 500,
      message:
        error instanceof Error ? error.message : "An unknown error occured",
      details: "[Unknown Error] (post) <deleteStudent()>",
    };

    console.error(localErr);

    return err(localErr);
  }
};
