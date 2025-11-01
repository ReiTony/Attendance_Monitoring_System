"use client";

import {
  Button,
  Center,
  Stack,
  Text,
  TextInput,
  Alert,
  LoadingOverlay,
} from "@mantine/core";
import Link from "next/link";
import { useRfid } from "@/hooks/rfid/useRfid";
import { useState } from "react";

export default function Home() {
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
      <Center w={"100vw"} h={"100vh"}>
        <LoadingOverlay visible />
      </Center>
    );
  }

  return (
    <Center w={"100vw"} h={"100vh"}>
      <Stack>
        <Text>Attendance Monitoring System</Text>

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

        <Button component={Link} href={"/login"}>
          Login
        </Button>
        <Button component={Link} href={"/attendance-summary"}>
          Attendance Summary
        </Button>
      </Stack>
    </Center>
  );
}
