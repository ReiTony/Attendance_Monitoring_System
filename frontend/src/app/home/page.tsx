"use client";

import AppShell from "@/app/components/core/AppShell";
import { Title, Text, Center, LoadingOverlay } from "@mantine/core";
import { useTeacher } from "@/hooks/useTeacher";

export default function Home() {
  const { teacherWithAccessToken, loading } = useTeacher();

  console.log(teacherWithAccessToken);

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
      <Title order={2} mb="md">
        Dashboard
      </Title>
      <Text>Select an option from the sidebar to get started.</Text>
    </AppShell>
  );
}
