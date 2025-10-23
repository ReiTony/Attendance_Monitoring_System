"use client";

import { useTeacher } from "@/hooks/useTeacher";
import { useStudents } from "@/hooks/useStudents";
import {
  Center,
  Container,
  LoadingOverlay,
  Space,
  Text,
  Title,
  Alert,
} from "@mantine/core";
import AppShell from "@/app/components/core/AppShell";
import StudentsListTable from "@/app/components/StudentsListTable";

export default function StudentsList() {
  const { teacherWithAccessToken, loading: teacherLoading } = useTeacher();
  const { students, loading: studentsLoading, error } = useStudents();

  const loading = teacherLoading || studentsLoading;

  if (loading) {
    return (
      <Center w={"100%"} h={"100vh"}>
        <LoadingOverlay />
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

  if (error) {
    return (
      <AppShell teacher={teacherWithAccessToken.teacher}>
        <Container size="xl">
          <Title order={2} mb="md">
            Students List
          </Title>
          <Space h="md" />
          <Alert color="red" title="Error">
            Error loading students: {error}
          </Alert>
        </Container>
      </AppShell>
    );
  }

  return (
    <AppShell teacher={teacherWithAccessToken.teacher}>
      <Container size="xl">
        <Title order={2} mb="md">
          Students List
        </Title>
        <Space h="md" />
        <StudentsListTable students={students} loading={loading} />
      </Container>
    </AppShell>
  );
}
