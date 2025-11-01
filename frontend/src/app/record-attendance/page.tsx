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
  Container,
} from "@mantine/core";
import { useRfid } from "@/hooks/rfid/useRfid";
import { useState } from "react";

export default function RecordAttendance() {
  const { teacherWithAccessToken } = useTeacher();
  const { record, attendanceRecord, success, loading, error } = useRfid();
  const [rfidValue, setRfidValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rfidValue.trim()) {
      await record(rfidValue);
      setRfidValue(""); // Clear input after submission
    }
  };

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

          {attendanceRecord && (
            <Alert color="blue" title="Attendance Record">
              <Stack gap="xs">
                <Text size="sm">
                  <strong>Student:</strong> {attendanceRecord.studentName}
                </Text>
                <Text size="sm">
                  <strong>Status:</strong> {attendanceRecord.status}
                </Text>
                <Text size="sm">
                  <strong>Time:</strong>{" "}
                  {attendanceRecord.timeIn
                    ? new Date(attendanceRecord.timeIn).toLocaleString()
                    : "N/A"}
                </Text>
              </Stack>
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
