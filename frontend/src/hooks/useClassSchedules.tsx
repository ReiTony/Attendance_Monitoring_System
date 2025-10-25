import { ClassScheduleListView } from "@/dto/classScheduleView";
import { getClassSchedules } from "@/services/classSchedulesService";
import { useCallback, useEffect, useState } from "react";
import { useTeacher } from "@/hooks/useTeacher";

export function useClassSchedules() {
  const { teacherWithAccessToken } = useTeacher();
  const [classSchedules, setClassSchedules] =
    useState<ClassScheduleListView | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    if (!teacherWithAccessToken) return;
    const result = await getClassSchedules(
      teacherWithAccessToken.teacher.section,
    );

    if ("error" in result) {
      setError(result.error.message);
    } else {
      // Convert from snake_case to camelCase
      console.log(result.data);
      const dataView: ClassScheduleListView = result.data.map(
        (classSchedule) => ({
          id: classSchedule._id,
          section: classSchedule.section,
          subject: classSchedule.subject,
          teacherName: classSchedule.teacher_name,
          day: classSchedule.day,
          startTime: classSchedule.start_time,
          endTime: classSchedule.end_time,
          room: classSchedule.room,
          createdAt: classSchedule.created_at,
        }),
      );

      setClassSchedules(dataView);
    }
    setLoading(false);
  }, [teacherWithAccessToken]);

  useEffect(() => {
    if (!classSchedules) {
      load();
    }
  }, [classSchedules, load]);

  return {
    classSchedules,
    loading,
    error,
  };
}
