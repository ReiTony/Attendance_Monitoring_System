"use client";

import { useState } from "react";
import {
  Center,
  LoadingOverlay,
  Text,
  Title,
  Container,
  Space,
} from "@mantine/core";
import AppShell from "@/app/components/core/AppShell";
import { useTeacher } from "@/hooks/useTeacher";
import { useAttendanceLogs } from "@/hooks/useAttendanceLogs";
import AttendanceLogsTable from "@/app/components/AttendanceLogsTable";

const AttendanceLogs = () => {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const { teacherWithAccessToken, loading: teacherLoading } = useTeacher();
  const {
    attendanceLogs,
    loading: logsLoading,
    error,
  } = useAttendanceLogs(startDate, endDate);

  if (teacherLoading) {
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

  if (error) {
    return (
      <AppShell teacher={teacherWithAccessToken.teacher}>
        <Container size="xl">
          <Title order={2} mb="md">
            Attendance Logs
          </Title>
          <Space h="md" />
          <Center>
            <Text color="red">Error loading attendance logs: {error}</Text>
          </Center>
        </Container>
      </AppShell>
    );
  }

  return (
    <AppShell teacher={teacherWithAccessToken.teacher}>
      <Container size="xl">
        <Title order={2} mb="md">
          Attendance Logs
        </Title>
        <Space h="md" />
        <AttendanceLogsTable
          attendanceLogs={attendanceLogs}
          loading={logsLoading}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </Container>
    </AppShell>
  );
};

export default AttendanceLogs;
