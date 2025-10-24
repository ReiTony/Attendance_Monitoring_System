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
import { useState } from "react";
import { authLogin } from "@/services/teacherService";
import { useRouter } from "next/navigation";

export default function TeacherLoginForm() {
  // const [state, action, isPending] = useActionState(login, { message: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!password) {
      setError("Please enter a valid password");
      return;
    }

    setLoading(true);
    const result = await authLogin({ email, password });

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setLoading(false);
    router.push("/attendance-logs");
  };

  return (
    <Paper shadow="xs" p="md" w={400}>
      <Title order={2} ta="center" mb="md">
        Teacher Login
      </Title>

      {error && (
        <Alert color="red" title="Error">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
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

          <Button type="submit" fullWidth mt="md" loading={loading}>
            Login
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
