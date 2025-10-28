"use client";

import { useState } from "react";
import {
  Table,
  ScrollArea,
  TextInput,
  Box,
  Group,
  Loader,
} from "@mantine/core";
import { AttendanceLogListView } from "@/dto/attendanceLogsView";

interface AttendanceLogsTableProps {
  attendanceLogs: AttendanceLogListView | null;
  loading: boolean;
}

export const AttendanceLogsTable = ({
  attendanceLogs,
  loading,
}: AttendanceLogsTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logs based on search query
  const filteredLogs =
    attendanceLogs?.attendanceLogs.filter((log) => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          log.studentName.toLowerCase().includes(query) ||
          log.studentId.toLowerCase().includes(query)
        );
      }

      return true;
    }) || [];

  return (
    <Box>
      <Group mb="md">
        <TextInput
          placeholder="Search by student name or ID"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          style={{ flex: 1 }}
        />
      </Group>

      <ScrollArea>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Student ID</Table.Th>
              <Table.Th>Student Name</Table.Th>
              <Table.Th>Section</Table.Th>
              <Table.Th>Total Lates</Table.Th>
              <Table.Th>Total Absences</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <Table.Tr key={log.studentId}>
                  <Table.Td>{log.studentId}</Table.Td>
                  <Table.Td>{log.studentName}</Table.Td>
                  <Table.Td>{log.section}</Table.Td>
                  <Table.Td>{log.totalLates}</Table.Td>
                  <Table.Td>{log.totalAbsences}</Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5} align="center">
                  {loading ? <Loader /> : "No attendance logs found"}
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Box>
  );
};

export default AttendanceLogsTable;
