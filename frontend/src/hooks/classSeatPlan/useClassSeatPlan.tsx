import { ClassSeatPlan } from "@/domain/classSeatPlan";
import { useCallback, useEffect, useState } from "react";
import { useStudents } from "../useStudents";

export function useClassSeatPlan() {
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
    if (!students) return;
    if (studentsError) setError(studentsError);

    const dataView: ClassSeatPlan = students.map((s) => ({
      firstName: s.firstName,
      lastName: s.lastName,
      studentId: s.studentIdNo,
      seatRow: s.seatRow,
      seatCol: s.seatCol,
    }));

    setClassSeatPlan(dataView);
    setLoading(false);
  }, [students, studentsLoading, studentsError]);

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
