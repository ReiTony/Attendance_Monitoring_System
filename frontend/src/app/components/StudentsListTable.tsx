import { StudentListView } from "@/dto/studentView";
import {
  Badge,
  Group,
  Paper,
  Skeleton,
  Table,
  Text,
  ThemeIcon,
  TextInput,
  ScrollArea,
  Anchor,
} from "@mantine/core";
import { useState } from "react";
import Link from "next/link";

type Props = {
  students: StudentListView | null;
  loading: boolean;
};

export default function StudentsListTable({ students, loading }: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  if (loading) {
    return (
      <Paper p="md" withBorder>
        <Skeleton height={40} mb="md" />
        <Skeleton height={300} />
      </Paper>
    );
  }

  if (!students || students.length === 0) {
    return (
      <Paper p="md" withBorder>
        <Text ta="center" c="dimmed">
          No students available
        </Text>
      </Paper>
    );
  }

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.studentIdNo.toLowerCase().includes(query) ||
        `${student.firstName.toLowerCase()} ${student.lastName.toLowerCase()}`.includes(
          query
        )
      );
    }

    return true;
  });

  return (
    <Paper p="md" withBorder>
      <Group mb="md">
        <TextInput
          placeholder="Search by name or ID"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          style={{ flex: 1 }}
        />
      </Group>

      <ScrollArea>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID Number</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Section</Table.Th>
              <Table.Th>Seat Position</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <Table.Tr key={student.id}>
                  <Table.Td>
                    <Group gap="xs">
                      <ThemeIcon size="sm" variant="light" color="blue">
                        <Text size="xs">🆔</Text>
                      </ThemeIcon>
                      <Text>{student.studentIdNo}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Anchor
                      component={Link}
                      href={`/student/${student.studentIdNo}`}
                      underline="never"
                      c="inherit"
                      fw={500}
                    >
                      {student.firstName} {student.lastName}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="indigo">{student.section}</Badge>
                  </Table.Td>
                  <Table.Td>
                    Row {student.seatRow}, Column {student.seatCol}
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4} align="center">
                  No students match the current filters
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}
