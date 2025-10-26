import { StudentListView } from "@/dto/studentView";
import { getStudents } from "@/services/studentServices";
import { useCallback, useEffect, useState } from "react";
import { useTeacher } from "@/hooks/useTeacher";

export function useStudents() {
  const { teacherWithAccessToken } = useTeacher();
  const [students, setStudents] = useState<StudentListView | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    if (!teacherWithAccessToken) return;
    const result = await getStudents(
      teacherWithAccessToken.teacher.section,
      teacherWithAccessToken.access_token,
    );

    if ("error" in result) {
      setError(result.error.message);
    } else {
      // Convert from snake_case to camelCase
      console.log(result.data);
      const d = result.data;
      const dataView: StudentListView = d.map((s) => ({
        id: s.id,
        firstName: s.first_name,
        lastName: s.last_name,
        section: s.section,
        studentIdNo: s.student_id_no,
        rfid_uid: s.rfid_uid,
        seatRow: s.seat_row,
        seatCol: s.seat_col,
      }));
      setStudents(dataView);
    }
    setLoading(false);
  }, [teacherWithAccessToken]);

  useEffect(() => {
    if (!students) {
      load();
    }
  }, [students, load]);

  return {
    students,
    loading,
    error,
  };
}
