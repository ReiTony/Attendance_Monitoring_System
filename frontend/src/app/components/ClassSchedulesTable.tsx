import { ClassScheduleListView } from "@/dto/classScheduleView";
import { formatTimeString } from "@/utils/dateFormatter";
import {
  Badge,
  Group,
  Paper,
  Skeleton,
  Table,
  Text,
  ThemeIcon,
  TextInput,
  Select,
  ScrollArea,
} from "@mantine/core";
import { useState, useEffect } from "react";

type Props = {
  classSchedules: ClassScheduleListView | null;
  loading: boolean;
};

const dayColors: Record<string, string> = {
  Mon: "blue",
  Tue: "green",
  Wed: "yellow",
  Thu: "orange",
  Fri: "pink",
};

export default function ClassSchedulesTable({
  classSchedules,
  loading,
}: Props) {
  const [filterDay, setFilterDay] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [days, setDays] = useState<string[]>([]);

  useEffect(() => {
    // Extract unique days for filtering if classSchedules is available
    if (classSchedules && classSchedules.length > 0) {
      const uniqueDays = Array.from(
        new Set(classSchedules.map((schedule) => schedule.day))
      );
      setDays(uniqueDays);
    }
  }, [classSchedules]);

  if (loading) {
    return (
      <Paper p="md" withBorder>
        <Skeleton height={40} mb="md" />
        <Skeleton height={300} />
      </Paper>
    );
  }

  if (!classSchedules || classSchedules.length === 0) {
    return (
      <Paper p="md" withBorder>
        <Text ta="center" c="dimmed">
          No class schedules available
        </Text>
      </Paper>
    );
  }

  // Filter schedules based on day and search query
  const filteredSchedules = classSchedules.filter((schedule) => {
    // Filter by day if selected
    if (filterDay && schedule.day !== filterDay) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        schedule.subject.toLowerCase().includes(query) ||
        schedule.teacherName.toLowerCase().includes(query) ||
        schedule.room.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <Paper p="md" withBorder>
      <Group mb="md">
        <TextInput
          placeholder="Search by subject, teacher or room"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Filter by day"
          value={filterDay}
          onChange={setFilterDay}
          data={days.map((day) => ({ value: day, label: day }))}
          clearable
          style={{ width: 150 }}
        />
      </Group>

      <ScrollArea>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Day</Table.Th>
              <Table.Th>Subject</Table.Th>
              <Table.Th>Section</Table.Th>
              <Table.Th>Time</Table.Th>
              <Table.Th>Room</Table.Th>
              <Table.Th>Teacher</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((schedule) => (
                <Table.Tr key={schedule.id}>
                  <Table.Td>
                    <Badge color={dayColors[schedule.day] || "gray"}>
                      {schedule.day}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ThemeIcon size="sm" variant="light" color="indigo">
                        <Text size="xs">📚</Text>
                      </ThemeIcon>
                      <Text>{schedule.subject}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{schedule.section}</Table.Td>
                  <Table.Td>
                    {formatTimeString(schedule.startTime)} -{" "}
                    {formatTimeString(schedule.endTime)}
                  </Table.Td>
                  <Table.Td>{schedule.room}</Table.Td>
                  <Table.Td>{schedule.teacherName}</Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={6} align="center">
                  No class schedules match the current filters
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}
