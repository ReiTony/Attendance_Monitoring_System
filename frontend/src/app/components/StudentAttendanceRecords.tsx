"use client";

import { useEffect, useState } from "react";
import { useAttendanceRecords } from "@/hooks/attendance/useAttendanceRecords";
import {
  Paper,
  Title,
  Table,
  Text,
  LoadingOverlay,
  Badge,
  Stack,
  Group,
  TextInput,
  Button,
} from "@mantine/core";
import StudentAttendanceRecordModal from "./StudentAttendanceRecordModal";
import { AttendanceRecordView } from "@/dto/attendanceRecord";

interface StudentAttendanceRecordsProps {
  studentId: string;
}

const StudentAttendanceRecords = ({
  studentId,
}: StudentAttendanceRecordsProps) => {
  const { getAttendanceSummary, attendanceRecords, loading, error } =
    useAttendanceRecords();
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [date, setDate] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<AttendanceRecordView | null>(null);

  useEffect(() => {
    if (studentId) {
      // Fetch attendance records with default parameters
      getAttendanceSummary(studentId, null, date);
    }
  }, [studentId, date, getAttendanceSummary]);

  // Filter records based on subject search
  const filteredRecords =
    attendanceRecords?.records.filter((record) =>
      record.subject.toLowerCase().includes(subjectFilter.toLowerCase())
    ) || [];

  const handleRowClick = (record: AttendanceRecordView) => {
    setSelectedRecord(record);
    setModalOpened(true);
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setSelectedRecord(null);
  };

  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      present: "green",
      absent: "red",
      late: "yellow",
      excused: "blue",
    };
    return (
      <Badge color={colors[status.toLowerCase()] || "gray"}>{status}</Badge>
    );
  };

  return (
    <Paper p="md" withBorder shadow="sm" mt="md">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={3}>Attendance Records</Title>
        </Group>

        <Group gap="md" align="flex-end">
          <TextInput
            label="Subject"
            placeholder="Search subject..."
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <TextInput
            label="Date"
            type="date"
            value={date || ""}
            onChange={(event) => setDate(event.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Button
            onClick={() => {
              setSubjectFilter("");
              setDate(null);
            }}
            variant="light"
          >
            Clear Filters
          </Button>
        </Group>

        {error && (
          <Text c="red" size="sm">
            Error loading attendance records: {error}
          </Text>
        )}

        <div style={{ position: "relative", minHeight: "500px" }}>
          <LoadingOverlay visible={loading} />

          {!loading && filteredRecords.length > 0 ? (
            <div
              style={{
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                overflow: "auto",
                maxHeight: "480px",
              }}
            >
              <Table
                striped
                highlightOnHover
                style={{
                  tableLayout: "fixed",
                  width: "1520px",
                }}
              >
                <Table.Thead
                  style={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "white",
                    zIndex: 1,
                  }}
                >
                  <Table.Tr>
                    <Table.Th style={{ width: "120px" }}>Date</Table.Th>
                    <Table.Th style={{ width: "250px" }}>Subject</Table.Th>
                    <Table.Th style={{ width: "100px" }}>Section</Table.Th>
                    <Table.Th style={{ width: "100px" }}>Time In</Table.Th>
                    <Table.Th style={{ width: "100px" }}>Time Out</Table.Th>
                    <Table.Th style={{ width: "100px" }}>Status</Table.Th>
                    <Table.Th style={{ width: "80px" }}>Late</Table.Th>
                    <Table.Th style={{ width: "100px" }}>Left Early</Table.Th>
                    <Table.Th style={{ width: "100px" }}>Breaks</Table.Th>
                    <Table.Th style={{ width: "250px" }}>Remarks</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredRecords.map((record) => (
                    <Table.Tr
                      key={record.id}
                      onClick={() => handleRowClick(record)}
                      style={{ cursor: "pointer" }}
                    >
                      <Table.Td style={{ width: "120px" }}>
                        {formatDate(record.lessonDate)}
                      </Table.Td>
                      <Table.Td style={{ width: "250px" }}>
                        {record.subject}
                      </Table.Td>
                      <Table.Td style={{ width: "100px" }}>
                        {record.section}
                      </Table.Td>
                      <Table.Td style={{ width: "100px" }}>
                        {formatTime(record.timeIn)}
                      </Table.Td>
                      <Table.Td style={{ width: "100px" }}>
                        {formatTime(record.timeOut)}
                      </Table.Td>
                      <Table.Td style={{ width: "100px" }}>
                        {getStatusBadge(record.status)}
                      </Table.Td>
                      <Table.Td style={{ width: "80px" }}>
                        {record.late ? (
                          <Badge color="orange" size="sm">
                            Yes
                          </Badge>
                        ) : (
                          <Text size="sm">No</Text>
                        )}
                      </Table.Td>
                      <Table.Td style={{ width: "100px" }}>
                        {record.leftEarly ? (
                          <Badge color="orange" size="sm">
                            Yes
                          </Badge>
                        ) : (
                          <Text size="sm">No</Text>
                        )}
                      </Table.Td>
                      <Table.Td style={{ width: "100px" }}>
                        {record.breaks.length > 0 ? (
                          <Text size="sm">{record.breaks.length} break(s)</Text>
                        ) : (
                          <Text size="sm">-</Text>
                        )}
                      </Table.Td>
                      <Table.Td style={{ width: "250px" }}>
                        {record.remarks || "-"}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          ) : (
            !loading && (
              <Text c="dimmed" ta="center" py="xl">
                No attendance records found for this student.
              </Text>
            )
          )}
        </div>
      </Stack>

      <StudentAttendanceRecordModal
        opened={modalOpened}
        onClose={handleCloseModal}
        record={selectedRecord}
      />
    </Paper>
  );
};

export default StudentAttendanceRecords;
