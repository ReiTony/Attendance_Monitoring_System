import {
  Card,
  Grid,
  Badge,
  Paper,
  Text,
  Box,
  Avatar,
  Group,
  Divider,
} from "@mantine/core";
import { StudentView } from "@/dto/studentView";

interface StudentInfoCardProps {
  student: StudentView;
}

const StudentInfoCard = ({ student }: StudentInfoCardProps) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section p="md" bg="blue.1">
        <Group>
          <Avatar size="xl" color="blue" radius="xl">
            {student.firstName[0]}
            {student.lastName[0]}
          </Avatar>
          <div>
            <Text fw={700} size="xl">
              {student.firstName} {student.lastName}
            </Text>
            <Badge variant="light">{student.section}</Badge>
          </div>
        </Group>
      </Card.Section>

      <Box mt="md">
        <Divider my="sm" label="Student Information" labelPosition="center" />

        <Grid gutter="lg">
          <Grid.Col span={6}>
            <Paper withBorder p="md" radius="md">
              <Text size="sm" c="dimmed">
                Student ID Number
              </Text>
              <Text fw={500}>{student.studentIdNo}</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={6}>
            <Paper withBorder p="md" radius="md">
              <Text size="sm" c="dimmed">
                Section
              </Text>
              <Text fw={500}>{student.section}</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={6}>
            <Paper withBorder p="md" radius="md">
              <Text size="sm" c="dimmed">
                RFID UID
              </Text>
              <Text fw={500}>{student.rfid_uid}</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={6}>
            <Paper withBorder p="md" radius="md">
              <Text size="sm" c="dimmed">
                Seat Position (Row, Column)
              </Text>
              <Text fw={500}>
                {student.seatRow}, {student.seatCol}
              </Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={6}>
            <Paper withBorder p="md" radius="md">
              <Text size="sm" c="dimmed">
                Entry ID
              </Text>
              <Text fw={500}>{student.id}</Text>
            </Paper>
          </Grid.Col>
        </Grid>
      </Box>
    </Card>
  );
};

export default StudentInfoCard;
