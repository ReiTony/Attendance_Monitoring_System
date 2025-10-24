"use client";

import AppShell from "../components/core/AppShell";
import ClassSeatPlan from "../components/ClassSeatPlan";
import { useTeacher } from "@/hooks/useTeacher";

export default function ClassSeatPlanPage() {
  const { teacherWithAccessToken } = useTeacher();

  if (!teacherWithAccessToken) {
    return null;
  }

  return (
    <AppShell teacher={teacherWithAccessToken.teacher}>
      <ClassSeatPlan />
    </AppShell>
  );
}
