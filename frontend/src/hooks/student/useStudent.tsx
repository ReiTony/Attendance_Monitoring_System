import { StudentView } from "@/dto/studentView";
import { getStudent } from "@/services/studentServices";
import { useCallback, useEffect, useState } from "react";
import { useTeacher } from "@/hooks/useTeacher";

export function useStudent(id: string) {
  const { teacherWithAccessToken } = useTeacher();
  const [student, setStudent] = useState<StudentView | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    if (!teacherWithAccessToken) return;
    const result = await getStudent(id, teacherWithAccessToken.access_token);

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
  }, [teacherWithAccessToken, id]);

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
