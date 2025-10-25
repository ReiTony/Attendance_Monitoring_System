import { ClassSeatPlan } from "@/domain/classSeatPlan";
import { useCallback, useEffect, useState } from "react";
import { useStudents } from "@/hooks/useStudents";
import { useTeacher } from "@/hooks/useTeacher";

export function useClassSeatPlan() {
  const { teacherWithAccessToken } = useTeacher();
  const [classSeatPlan, setClassSeatPlan] = useState<ClassSeatPlan | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {
    students,
    loading: studentsLoading,
    error: studentsError,
  } = useStudents();

  const load = useCallback(async () => {
    setLoading(studentsLoading);
    if (!teacherWithAccessToken) return;
    if (!students) return;
    if (studentsError) setError(studentsError);

    const dataView: ClassSeatPlan = students.map((s) => ({
      firstName: s.firstName,
      lastName: s.lastName,
      studentId: s.studentIdNo,
      section: s.section,
      seatRow: s.seatRow,
      seatCol: s.seatCol,
    }));

    const filteredData: ClassSeatPlan = dataView.filter(
      (value) => value.section === teacherWithAccessToken.teacher.section,
    );

    setClassSeatPlan(filteredData);
    setLoading(false);
  }, [students, studentsLoading, studentsError, teacherWithAccessToken]);

  useEffect(() => {
    if (!classSeatPlan) {
      load();
    }
  }, [classSeatPlan, load]);

  return {
    classSeatPlan,
    loading,
    error,
  };
}
