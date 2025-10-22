import { StudentView } from "@/dto/studentView";
import { getStudent } from "@/services/studentServices";
import { useCallback, useEffect, useState } from "react";

export function useStudent() {
  const [student, setStudent] = useState<StudentView | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getStudent();

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
        studentIdNo: d.student_id_no,
        seatRow: d.seat_row,
        seatCol: d.seat_col,
      };
      setStudent(dataView);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!student) {
      load();
    }
  }, [student, load]);

  return {
    student,
    loading,
    error,
  };
}
