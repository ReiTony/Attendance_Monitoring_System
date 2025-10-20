"use client";

import { useState } from "react";
import {
  AppShell,
  Burger,
  Group,
  Title,
  NavLink,
  UnstyledButton,
  Stack,
  Text,
  Avatar,
  Center,
  LoadingOverlay,
} from "@mantine/core";
import { useTeacher } from "@/hooks/useTeacher";

export default function Home() {
  const [opened, setOpened] = useState(false);

  const { teacherWithAccessToken, loading } = useTeacher();

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
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={opened}
            onClick={() => setOpened((o) => !o)}
            hiddenFrom="sm"
            size="sm"
          />
          <Title order={3}>Attendance Monitoring System</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section mb="md">
          <UnstyledButton>
            <Group>
              <Avatar color="blue" radius="xl">
                TC
              </Avatar>
              <div>
                <Text size="sm" fw={500}>
                  {teacherWithAccessToken.teacher.firstName +
                    " " +
                    teacherWithAccessToken.teacher.lastName}
                </Text>
                <Text c="dimmed" size="xs">
                  {teacherWithAccessToken.teacher.email}
                </Text>
              </div>
            </Group>
          </UnstyledButton>
        </AppShell.Section>

        <AppShell.Section grow>
          <Stack gap={8}>
            <NavLink label="Class Schedule" active />
            <NavLink label="Attendance Logs" />
            <NavLink label="Class Seat Plan" />
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Text size="xs" c="dimmed" ta="center" py="md">
            © 2025 Attendance Monitoring System
          </Text>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Title order={2} mb="md">
          Dashboard
        </Title>
        <Text>Select an option from the sidebar to get started.</Text>
      </AppShell.Main>
    </AppShell>
  );
}
