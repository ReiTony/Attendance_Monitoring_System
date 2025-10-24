import { useCallback, useState } from "react";
import { useTeacher } from "@/hooks/useTeacher";
import { deleteStudent as deleteStudentCall } from "@/services/studentServices";

export function useDeleteStudent() {
  const { teacherWithAccessToken } = useTeacher();
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deleteStudent = useCallback(
    async (id: string) => {
      setLoading(true);
      if (!teacherWithAccessToken) return;
      const result = await deleteStudentCall(
        id,
        teacherWithAccessToken.access_token,
      );

      if ("error" in result) {
        setError(result.error.message);
      } else {
        setSuccess("Successfully deleted student data");
      }
    },
    [teacherWithAccessToken],
  );

  return {
    deleteStudent,
    loading,
    success,
    error,
  };
}
