"use client";

import { useTeacher } from "@/hooks/useTeacher";
import { useClassSchedules } from "@/hooks/useClassSchedules";
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
import ClassSchedulesTable from "@/app/components/ClassSchedulesTable";

export default function ClassSchedules() {
  const { teacherWithAccessToken, loading: teacherLoading } = useTeacher();
  const {
    classSchedules,
    loading: schedulesLoading,
    error,
  } = useClassSchedules();

  const loading = teacherLoading || schedulesLoading;

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
            Class Schedules
          </Title>
          <Space h="md" />
          <Alert color="red" title="Error">
            Error loading class schedules: {error}
          </Alert>
        </Container>
      </AppShell>
    );
  }

  return (
    <AppShell teacher={teacherWithAccessToken.teacher}>
      <Container size="xl">
        <Title order={2} mb="md">
          Class Schedules
        </Title>
        <Space h="md" />
        <ClassSchedulesTable
          classSchedules={classSchedules}
          loading={loading}
        />
      </Container>
    </AppShell>
  );
}
