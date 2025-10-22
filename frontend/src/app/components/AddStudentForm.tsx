"use client";

import { StudentForm } from "@/dto/studentForm";
import { useCreateStudent } from "@/hooks/useAddStudent";
import {
  TextInput,
  NumberInput,
  Button,
  Group,
  Box,
  Paper,
  Title,
  Alert,
  Stack,
  Text,
  Divider,
  Card,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";

type Props = {
  token: string;
};

export default function AddStudentForm({ token }: Props) {
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const { create, loading, error, student } = useCreateStudent();

  const form = useForm({
    initialValues: {
      first_name: "",
      last_name: "",
      section: "",
      rfid_uid: "",
      student_id_no: "",
      seat_row: 0,
      seat_col: 0,
    },

    validate: {
      first_name: (value) => (value ? null : "First name is required"),
      last_name: (value) => (value ? null : "Last name is required"),
      section: (value) => (value ? null : "Section is required"),
      student_id_no: (value) => {
        if (!value) return "Student ID is required";
        if (value.length < 5) return "Student ID must be at least 5 characters";
        return null;
      },
      rfid_uid: (value) => {
        if (!value) return "RFID UID is required";
        return null;
      },
      seat_row: (value) => (value < 0 ? "Row cannot be negative" : null),
      seat_col: (value) => (value < 0 ? "Column cannot be negative" : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    // Convert form values to StudentForm type
    const studentForm: StudentForm = {
      first_name: values.first_name,
      last_name: values.last_name,
      section: values.section,
      rfid_uid: values.rfid_uid,
      student_id_no: values.student_id_no,
      seat_row: values.seat_row,
      seat_col: values.seat_col,
    };

    // Submit the form
    await create({ token, form: studentForm });

    // Set success state if no errors
    if (!error) {
      setSubmissionSuccess(true);
      form.reset();
    }
  };

  return (
    <Paper p="md" shadow="xs" withBorder>
      <Title order={3} mb="md">
        Add New Student
      </Title>

      {error && (
        <Alert title="Error" color="red" mb="md">
          {error}
        </Alert>
      )}

      {submissionSuccess && student && (
        <Alert title="Success" color="green" mb="md">
          Student added successfully!
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Group grow>
            <TextInput
              label="First Name"
              placeholder="Enter first name"
              {...form.getInputProps("first_name")}
              required
            />

            <TextInput
              label="Last Name"
              placeholder="Enter last name"
              {...form.getInputProps("last_name")}
              required
            />
          </Group>

          <TextInput
            label="Section"
            placeholder="e.g. ICT12A"
            {...form.getInputProps("section")}
            required
          />

          <TextInput
            label="Student ID Number"
            placeholder="Enter student ID"
            {...form.getInputProps("student_id_no")}
            required
          />

          <TextInput
            label="RFID UID"
            placeholder="Enter RFID unique identifier"
            {...form.getInputProps("rfid_uid")}
            required
          />

          <Group grow>
            <NumberInput
              label="Seat Row"
              placeholder="Row number"
              min={0}
              {...form.getInputProps("seat_row")}
            />

            <NumberInput
              label="Seat Column"
              placeholder="Column number"
              min={0}
              {...form.getInputProps("seat_col")}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button type="submit" loading={loading}>
              Add Student
            </Button>
          </Group>
        </Stack>
      </form>

      {submissionSuccess && student && (
        <Box mt="xl">
          <Divider my="md" label="Student Added" labelPosition="center" />
          <Card withBorder>
            <Title order={5}>
              {student.firstName} {student.lastName}
            </Title>
            <Text size="sm">ID: {student.studentIdNo}</Text>
            <Text size="sm">Section: {student.section}</Text>
            <Text size="sm">
              Seat: Row {student.seatRow}, Column {student.seatCol}
            </Text>
          </Card>
        </Box>
      )}
    </Paper>
  );
}
