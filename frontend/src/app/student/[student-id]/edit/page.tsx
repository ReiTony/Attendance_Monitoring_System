"use client";

import {
  Center,
  Container,
  LoadingOverlay,
  Space,
  Text,
  Title,
} from "@mantine/core";
import AppShell from "@/app/components/core/AppShell";
import { useTeacher } from "@/hooks/useTeacher";
import UpdateStudentForm from "@/app/components/UpdateStudentForm";
import { useParams } from "next/navigation";
import { useStudent } from "@/hooks/student/useStudent";

export default function UpdateStudent() {
  const { "student-id": studentId } = useParams();
  const { teacherWithAccessToken, loading: teacherLoading } = useTeacher();
  const {
    student,
    loading: studentLoading,
    error,
  } = useStudent(studentId as string);

  const loading = teacherLoading || studentLoading;

  if (loading) {
    return (
      <Center w={"100%"} h={"100vh"}>
        <LoadingOverlay visible />
      </Center>
    );
  }

  if (!teacherWithAccessToken) {
    return (
      <Center>
        <Text>Not Logged In</Text>
      </Center>
    );
  }

  if (error || !student) {
    return (
      <AppShell teacher={teacherWithAccessToken.teacher}>
        <Container size="xl">
          <Center>
            <Text c="red">Error: {error || "Student not found"}</Text>
          </Center>
        </Container>
      </AppShell>
    );
  }

  return (
    <AppShell teacher={teacherWithAccessToken.teacher}>
      <Container size="xl">
        <Title order={2} mb="md">
          Update Student
        </Title>
        <Space h="md" />
        <UpdateStudentForm
          token={teacherWithAccessToken.access_token}
          student={student}
          studentId={studentId as string}
        />
      </Container>
    </AppShell>
  );
}
