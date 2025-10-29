"use client";

import { useStudent } from "@/hooks/student/useStudent";
import { useParams, useRouter } from "next/navigation";
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
  Modal,
  Alert,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MdDelete, MdCheckCircle, MdError } from "react-icons/md";
import Link from "next/link";
import { useDeleteStudent } from "@/hooks/student/useDeleteStudent";
import { useEffect } from "react";

export default function StudentDetails() {
  const { "student-id": studentId } = useParams();
  const { student, loading, error } = useStudent(studentId as string);
  const { teacherWithAccessToken, loading: teacherLoading } = useTeacher();
  const {
    deleteStudent,
    loading: deleteLoading,
    success,
    error: deleteError,
  } = useDeleteStudent();
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  useEffect(() => {
    if (success) {
      // Redirect to students list after successful deletion
      setTimeout(() => {
        router.push("/students-list");
      }, 2000);
    }
  }, [success, router]);

  const handleDelete = async () => {
    if (student) {
      await deleteStudent(student.studentIdNo);
      close();
    }
  };

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
        {success && (
          <Alert
            icon={<MdCheckCircle size={20} />}
            title="Success"
            color="green"
            mb="md"
            withCloseButton={false}
          >
            {success} - Redirecting to students list...
          </Alert>
        )}

        {deleteError && (
          <Alert
            icon={<MdError size={20} />}
            title="Error"
            color="red"
            mb="md"
            withCloseButton
          >
            {deleteError}
          </Alert>
        )}

        <Group justify="space-between" mb="md">
          <Group>
            <Button component={Link} href="/students-list">
              Back
            </Button>
            <Title order={2}>Student Details</Title>
          </Group>
          <Group>
            <Button
              component={Link}
              href={`/student/${student.studentIdNo}/edit`}
            >
              Edit Student
            </Button>
            <Button
              color="red"
              leftSection={<MdDelete size={18} />}
              onClick={open}
              loading={deleteLoading}
            >
              Delete Student
            </Button>
          </Group>
        </Group>

        <Modal opened={opened} onClose={close} title="Delete Student" centered>
          <Stack gap="md">
            <Text>
              Are you sure you want to delete{" "}
              <strong>
                {student.firstName} {student.lastName}
              </strong>
              ? This action cannot be undone.
            </Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={close}>
                Cancel
              </Button>
              <Button
                color="red"
                onClick={handleDelete}
                loading={deleteLoading}
              >
                Delete
              </Button>
            </Group>
          </Stack>
        </Modal>

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
                    RFID UID
                  </Text>
                  <Text fw={500}>{student.rfid_uid}</Text>
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
