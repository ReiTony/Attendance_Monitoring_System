"use client";

import { useState } from "react";
import { Box, Button, TextInput, Title, Stack, Group } from "@mantine/core";
import { useAttendanceLogs } from "@/hooks/attendance/useAttendanceSummary";
import { AttendanceLogsTable } from "@/app/components/AttendanceLogsTable";
import { useRouter } from "next/navigation";

export default function AttendanceSummary() {
  const [section, setSection] = useState("");
  const { getAttendanceSummary, attendanceLogs, loading, error } =
    useAttendanceLogs();
  const router = useRouter();

  const handleFetchSummary = () => {
    if (section.trim()) {
      getAttendanceSummary(section);
    }
  };

  return (
    <Box p="md">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Button onClick={() => router.push("/")}>Back</Button>
          <Title order={1}>Attendance Summary</Title>
          <Box style={{ width: 70 }} /> {/* Spacer for centering */}
        </Group>

        <Box style={{ maxWidth: 400 }}>
          <TextInput
            label="Section"
            placeholder="Enter section"
            value={section}
            onChange={(event) => setSection(event.currentTarget.value)}
            mb="md"
          />
          <Button
            onClick={handleFetchSummary}
            disabled={!section.trim()}
            loading={loading}
          >
            Get Attendance Summary
          </Button>
        </Box>

        {error && <Box c="red">{error}</Box>}

        <AttendanceLogsTable
          attendanceLogs={attendanceLogs}
          loading={loading}
        />
      </Stack>
    </Box>
  );
}
