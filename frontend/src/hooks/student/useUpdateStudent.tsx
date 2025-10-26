import { StudentUpdateForm } from "@/dto/studentForm";
import { StudentView } from "@/dto/studentView";
import { putStudent } from "@/services/studentServices";
import { useCallback, useState } from "react";

export function useUpdateStudent() {
  const [student, setStudent] = useState<StudentView | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateStudent = useCallback(
    async (id: string, form: StudentUpdateForm, token?: string) => {
      setLoading(true);
      const result = await putStudent(id, form, token);

      if ("error" in result) {
        setError(result.error.message);
      } else {
        // Convert from snake_case to camelCase
        console.log(result.data);
        const d = result.data;
        const dataView: StudentView = {
          id: d.id,
          firstName: d.first_name,
          lastName: d.last_name,
          section: d.section,
          rfid_uid: d.rfid_uid,
          studentIdNo: d.student_id_no,
          seatRow: d.seat_row,
          seatCol: d.seat_col,
        };
        setStudent(dataView);
      }
      setLoading(false);
    },
    []
  );

  return {
    student,
    loading,
    error,
    updateStudent,
  };
}
