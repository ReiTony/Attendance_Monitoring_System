"use client";

import { useTeacher } from "@/hooks/useTeacher";
import AppShell from "../components/core/AppShell";
import {
  TextInput,
  Button,
  Text,
  Alert,
  Stack,
  Center,
  LoadingOverlay,
  Container,
} from "@mantine/core";
import { useRfid } from "@/hooks/rfid/useRfid";
import { useState } from "react";

export default function RecordAttendance() {
  const { teacherWithAccessToken } = useTeacher();
  const { record, success, loading, error } = useRfid();
  const [rfidValue, setRfidValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rfidValue.trim()) {
      await record(rfidValue);
      setRfidValue(""); // Clear input after submission
    }
  };

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
      <Container size={"xl"}>
        <Stack>
          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                label="RFID"
                value={rfidValue}
                onChange={(e) => setRfidValue(e.currentTarget.value)}
                placeholder="Enter RFID"
                required
              />
              <Button type="submit" loading={loading}>
                Record Attendance
              </Button>
            </Stack>
          </form>

          {success && (
            <Alert color="green" title="Success">
              {success}
            </Alert>
          )}

          {error && (
            <Alert color="red" title="Error">
              {error}
            </Alert>
          )}
        </Stack>
      </Container>
    </AppShell>
  );
}
