import {
  Modal,
  Stack,
  Group,
  Text,
  Badge,
  Divider,
  Title,
} from "@mantine/core";
import { AttendanceRecordView } from "@/dto/attendanceRecord";

interface StudentAttendanceRecordModalProps {
  opened: boolean;
  onClose: () => void;
  record: AttendanceRecordView | null;
}

const StudentAttendanceRecordModal = ({
  opened,
  onClose,
  record,
}: StudentAttendanceRecordModalProps) => {
  if (!record) return null;

  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
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
      <Badge color={colors[status.toLowerCase()] || "gray"} size="lg">
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={"Attendance Record Details"}
      size="lg"
      centered
    >
      <Stack gap="md">
        {/* Student Information */}
        <div>
          <Text size="sm" c="dimmed" fw={500}>
            Student
          </Text>
          <Text size="lg" fw={600}>
            {record.studentName}
          </Text>
          <Text size="sm" c="dimmed">
            ID: {record.studentId}
          </Text>
        </div>

        <Divider />

        {/* Class Information */}
        <Group grow>
          <div>
            <Text size="sm" c="dimmed" fw={500}>
              Subject
            </Text>
            <Text fw={500}>{record.subject}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed" fw={500}>
              Section
            </Text>
            <Text fw={500}>{record.section}</Text>
          </div>
        </Group>

        <div>
          <Text size="sm" c="dimmed" fw={500}>
            Date
          </Text>
          <Text fw={500}>{formatDate(record.lessonDate)}</Text>
        </div>

        <Divider />

        {/* Attendance Status */}
        <div>
          <Text size="sm" c="dimmed" fw={500} mb="xs">
            Status
          </Text>
          {getStatusBadge(record.status)}
        </div>

        {/* Time Information */}
        <Group grow>
          <div>
            <Text size="sm" c="dimmed" fw={500}>
              Time In
            </Text>
            <Text fw={500}>{formatTime(record.timeIn)}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed" fw={500}>
              Time Out
            </Text>
            <Text fw={500}>{formatTime(record.timeOut)}</Text>
          </div>
        </Group>

        {/* Attendance Flags */}
        <Group grow>
          <div>
            <Text size="sm" c="dimmed" fw={500} mb="xs">
              Late
            </Text>
            {record.late ? (
              <Badge color="orange">Yes</Badge>
            ) : (
              <Badge color="gray">No</Badge>
            )}
          </div>
          <div>
            <Text size="sm" c="dimmed" fw={500} mb="xs">
              Left Early
            </Text>
            {record.leftEarly ? (
              <Badge color="orange">Yes</Badge>
            ) : (
              <Badge color="gray">No</Badge>
            )}
          </div>
        </Group>

        <Divider />

        {/* Break Information */}
        <div>
          <Text size="sm" c="dimmed" fw={500} mb="xs">
            Breaks
          </Text>
          {record.breaks.length > 0 ? (
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                Total Break Time: {formatDuration(record.totalBreakSeconds)}
              </Text>
              {record.breaks.map((breakItem, index) => (
                <Group key={index} gap="xs">
                  <Badge color="blue" variant="light">
                    Break {index + 1}
                  </Badge>
                  <Text size="sm">
                    {formatTime(breakItem.start)} - {formatTime(breakItem.end)}
                  </Text>
                  <Text size="sm" c="dimmed">
                    ({breakItem.duration})
                  </Text>
                </Group>
              ))}
            </Stack>
          ) : (
            <Text size="sm" c="dimmed">
              No breaks recorded
            </Text>
          )}
        </div>

        {/* Remarks */}
        {record.remarks && (
          <>
            <Divider />
            <div>
              <Text size="sm" c="dimmed" fw={500} mb="xs">
                Remarks
              </Text>
              <Text size="sm">{record.remarks}</Text>
            </div>
          </>
        )}

        <Divider />

        {/* Additional Information */}
        <Group grow>
          <div>
            <Text size="sm" c="dimmed" fw={500}>
              Device
            </Text>
            <Text size="sm">{record.fromDevice || "-"}</Text>
          </div>
        </Group>

        <Group grow>
          <div>
            <Text size="xs" c="dimmed">
              Created: {formatDateTime(record.createdAt)}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Updated: {formatDateTime(record.updatedAt)}
            </Text>
          </div>
        </Group>
      </Stack>
    </Modal>
  );
};

export default StudentAttendanceRecordModal;
