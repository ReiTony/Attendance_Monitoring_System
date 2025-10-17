"use client";

import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Title,
  Paper,
  Alert,
} from "@mantine/core";
import { useActionState } from "react";
import { signup } from "./action";

export default function TeacherRegistrationForm() {
  const [state, action, isPending] = useActionState(signup, { message: "" });

  return (
    <Paper shadow="xs" p="md" w={400}>
      <Title order={2} ta="center" mb="md">
        Teacher Registration
      </Title>

      {state?.message !== "" && (
        <Alert color="red" title="Error">
          {state?.message}
        </Alert>
      )}

      <form action={action}>
        <Stack gap="md">
          <TextInput
            label="First Name"
            name="firstName"
            placeholder="Enter your first name"
            required
          />

          <TextInput
            label="Last Name"
            name="lastName"
            placeholder="Enter your last name"
            required
          />

          <TextInput
            label="Email"
            name="email"
            placeholder="your.email@example.com"
            required
          />

          <PasswordInput
            label="Password"
            name="password"
            placeholder="Create a password"
            required
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Create a password"
            required
          />

          <TextInput
            label="Section"
            name="section"
            placeholder="Enter your section"
            required
          />

          <Button type="submit" fullWidth mt="md" loading={isPending}>
            Register
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
