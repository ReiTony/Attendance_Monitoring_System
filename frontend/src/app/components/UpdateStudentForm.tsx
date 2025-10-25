"use client";

import { StudentUpdateForm } from "@/dto/studentForm";
import { StudentView } from "@/dto/studentView";
import { useUpdateStudent } from "@/hooks/student/useUpdateStudent";
import {
  TextInput,
  NumberInput,
  Button,
  Group,
  Paper,
  Title,
  Alert,
  Stack,
  Switch,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  token: string;
  student: StudentView;
  studentId: string;
};

export default function UpdateStudentForm({
  token,
  student,
  studentId,
}: Props) {
  const router = useRouter();
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const { updateStudent, loading, error } = useUpdateStudent();

  const form = useForm({
    initialValues: {
      first_name: student.firstName,
      last_name: student.lastName,
      section: student.section,
      rfid_uid: student.rfid_uid,
      student_id_no: student.studentIdNo,
      seat_row: student.seatRow,
      seat_col: student.seatCol,
      is_active: true,
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
    // Convert form values to StudentUpdateForm type
    const studentForm: StudentUpdateForm = {
      first_name: values.first_name,
      last_name: values.last_name,
      section: values.section,
      rfid_uid: values.rfid_uid,
      student_id_no: values.student_id_no,
      seat_row: values.seat_row,
      seat_col: values.seat_col,
      is_active: values.is_active,
    };

    // Submit the form
    await updateStudent(studentId, studentForm, token);

    // Set success state if no errors
    if (!error) {
      setSubmissionSuccess(true);
      // Redirect to student details page after a brief delay to show success message
      setTimeout(() => {
        router.push(`/student/${studentId}`);
      }, 1500);
    }
  };

  return (
    <Paper p="md" shadow="xs" withBorder>
      <Title order={3} mb="md">
        Update Student
      </Title>

      {error && (
        <Alert title="Error" color="red" mb="md">
          {error}
        </Alert>
      )}

      {submissionSuccess && (
        <Alert title="Success" color="green" mb="md">
          Student updated successfully! Redirecting...
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

          <Divider my="sm" />

          <Switch
            label="Student Active"
            {...form.getInputProps("is_active", { type: "checkbox" })}
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              onClick={() => router.push(`/student/${studentId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Update Student
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
