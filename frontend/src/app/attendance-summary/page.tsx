"use client";

import { useState } from "react";
import { Box, Button, Title, Stack, Group, NativeSelect } from "@mantine/core";
import { useAttendanceSummary } from "@/hooks/attendance/useAttendanceSummary";
import { AttendanceLogsTable } from "@/app/components/AttendanceLogsTable";
import { useRouter } from "next/navigation";

export default function AttendanceSummary() {
  const [section, setSection] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { getAttendanceSummary, attendanceLogs, loading, error } =
    useAttendanceSummary(selectedDate);
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
          <NativeSelect
            label="Section"
            value={section}
            onChange={(event) => setSection(event.currentTarget.value)}
            mb="md"
            data={[
              { value: "", label: "Select a section" },
              { value: "ICT12A", label: "ICT12A" },
            ]}
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
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </Stack>
    </Box>
  );
}
