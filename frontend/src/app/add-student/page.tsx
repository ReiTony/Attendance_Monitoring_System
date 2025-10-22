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
import AddStudentForm from "@/app/components/AddStudentForm";

export default function AddStudent() {
  const { teacherWithAccessToken, loading: teacherLoading } = useTeacher();

  const loading = teacherLoading;

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

  return (
    <AppShell teacher={teacherWithAccessToken.teacher}>
      <Container size="xl">
        <Title order={2} mb="md">
          Add New Student
        </Title>
        <Space h="md" />
        <AddStudentForm token={teacherWithAccessToken.access_token} />
      </Container>
    </AppShell>
  );
}
