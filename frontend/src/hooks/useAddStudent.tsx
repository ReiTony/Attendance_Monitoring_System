import { StudentForm } from "@/dto/studentForm";
import { StudentView } from "@/dto/studentView";
import { postStudent } from "@/services/studentServices";
import { useState } from "react";

export type CreateStudentObj = {
  token: string;
  form: StudentForm;
};

export function useCreateStudent() {
  const [student, setStudent] = useState<StudentView | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateStudentObj) => {
    setLoading(true);

    const result = await postStudent(data.token, data.form);

    if ("error" in result) {
      setError(result.error.message);
    } else {
      const d = result.data;
      const dataView: StudentView = {
        id: d.id,
        firstName: d.first_name,
        lastName: d.last_name,
        section: d.section,
        studentIdNo: d.student_id_no,
        seatRow: d.seat_row,
        seatCol: d.seat_col,
      };
      setStudent(dataView);
    }

    setLoading(false);
  };

  return {
    student,
    loading,
    error,
    create,
  };
}
