"use client";

import { TeacherWithAccessToken } from "@/domain/teacher";
import { clearTeacherCache, getCachedTeacher } from "@/services/teacherService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useTeacher() {
  const [teacherWithAccessToken, setTeacherWithAccessToken] =
    useState<TeacherWithAccessToken | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const cachedTeacher = getCachedTeacher();
    console.log("Retrieved cached user account: ", cachedTeacher);
    setTeacherWithAccessToken(cachedTeacher);
    setLoading(false);

    if (!cachedTeacher) {
      router.push("/login");
    }
  }, [router]);

  const logout = () => {
    clearTeacherCache();
    setTeacherWithAccessToken(null);
    router.push("/login");
  };

  return {
    teacherWithAccessToken,
    loading,
    isAuthenticated: !!teacherWithAccessToken,
    logout,
  };
}
