"use client";

import { useStudent } from "@/hooks/student/useStudent";
import { useParams } from "next/navigation";
import AppShell from "@/app/components/core/AppShell";
import { useTeacher } from "@/hooks/useTeacher";
import {
  Card,
  Container,
  Grid,
  Group,
  LoadingOverlay,
  Text,
  Title,
  Stack,
  Badge,
  Center,
  Paper,
  Button,
  Divider,
  Box,
  Avatar,
} from "@mantine/core";
import Link from "next/link";

export default function StudentDetails() {
  const { "student-id": studentId } = useParams();
  const { student, loading, error } = useStudent(studentId as string);
  const { teacherWithAccessToken, loading: teacherLoading } = useTeacher();

  if (teacherLoading || loading) {
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

  if (error) {
    return (
      <AppShell teacher={teacherWithAccessToken.teacher}>
        <Container size="xl">
          <Paper p="xl" withBorder shadow="md">
            <Center>
              <Stack align="center">
                <Text c="red" size="lg">
                  Error: {error}
                </Text>
                <Button component={Link} href="/students-list">
                  Back to Students List
                </Button>
              </Stack>
            </Center>
          </Paper>
        </Container>
      </AppShell>
    );
  }

  if (!student) {
    return (
      <AppShell teacher={teacherWithAccessToken.teacher}>
        <Container size="xl">
          <Paper p="xl" withBorder shadow="md">
            <Center>
              <Text>Student not found</Text>
            </Center>
          </Paper>
        </Container>
      </AppShell>
    );
  }

  return (
    <AppShell teacher={teacherWithAccessToken.teacher}>
      <Container size="xl">
        <Group justify="space-between" mb="md">
          <Group>
            <Button component={Link} href="/students-list" variant="subtle">
              Back
            </Button>
            <Title order={2}>Student Details</Title>
          </Group>
          <Button component={Link} href={`/student/${student.id}/edit`}>
            Edit Student
          </Button>
        </Group>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section p="md" bg="blue.1">
            <Group>
              <Avatar size="xl" color="blue" radius="xl">
                {student.firstName[0]}
                {student.lastName[0]}
              </Avatar>
              <div>
                <Text fw={700} size="xl">
                  {student.firstName} {student.lastName}
                </Text>
                <Badge variant="light">{student.section}</Badge>
              </div>
            </Group>
          </Card.Section>

          <Box mt="md">
            <Divider
              my="sm"
              label="Student Information"
              labelPosition="center"
            />

            <Grid gutter="lg">
              <Grid.Col span={6}>
                <Paper withBorder p="md" radius="md">
                  <Text size="sm" c="dimmed">
                    Student ID Number
                  </Text>
                  <Text fw={500}>{student.studentIdNo}</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={6}>
                <Paper withBorder p="md" radius="md">
                  <Text size="sm" c="dimmed">
                    Section
                  </Text>
                  <Text fw={500}>{student.section}</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={6}>
                <Paper withBorder p="md" radius="md">
                  <Text size="sm" c="dimmed">
                    Seat Position (Row, Column)
                  </Text>
                  <Text fw={500}>
                    {student.seatRow}, {student.seatCol}
                  </Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={6}>
                <Paper withBorder p="md" radius="md">
                  <Text size="sm" c="dimmed">
                    Entry ID
                  </Text>
                  <Text fw={500}>{student.id}</Text>
                </Paper>
              </Grid.Col>
            </Grid>
          </Box>
        </Card>
      </Container>
    </AppShell>
  );
}
