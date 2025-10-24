"use client";

import { useClassSeatPlan } from "@/hooks/classSeatPlan/useClassSeatPlan";
import {
  Avatar,
  Box,
  Center,
  Grid,
  LoadingOverlay,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import Link from "next/link";

export default function ClassSeatPlan() {
  const { classSeatPlan, loading, error } = useClassSeatPlan();

  if (error) {
    return (
      <Center h="100%">
        <Text c="red">{error}</Text>
      </Center>
    );
  }

  if (loading || !classSeatPlan) {
    return <LoadingOverlay visible />;
  }

  // Calculate the grid dimensions
  const maxRow = Math.max(...classSeatPlan.map((seat) => seat.seatRow), 0);
  const maxCol = Math.max(...classSeatPlan.map((seat) => seat.seatCol), 0);

  // Create a 2D grid to place students
  const seatGrid: ((typeof classSeatPlan)[0] | null)[][] = Array.from(
    { length: maxRow + 1 },
    () => Array(maxCol + 1).fill(null)
  );

  // Populate the grid with students
  classSeatPlan.forEach((seat) => {
    if (seat.seatRow >= 0 && seat.seatCol >= 0) {
      seatGrid[seat.seatRow][seat.seatCol] = seat;
    }
  });

  // Get initials from first and last name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Box p="xl">
      <Stack gap="xl">
        <Text size="xl" fw={700}>
          Class Seat Plan
        </Text>

        <Box style={{ overflowX: "auto" }}>
          <Stack gap="md">
            {seatGrid.map((row, rowIndex) => (
              <Grid key={rowIndex} gutter="md" justify="center">
                {row.map((seat, colIndex) => (
                  <Grid.Col key={colIndex} span="content">
                    {seat ? (
                      <Link
                        href={`/student/${seat.studentId}`}
                        style={{ textDecoration: "none" }}
                      >
                        <Paper
                          shadow="sm"
                          p="md"
                          withBorder
                          style={{
                            width: 150,
                            height: 150,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "transform 0.2s, box-shadow 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.boxShadow =
                              "0 8px 16px rgba(0, 0, 0, 0.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "";
                          }}
                        >
                          <Stack align="center" gap="xs">
                            <Avatar size="lg" radius="xl" color="blue">
                              {getInitials(seat.firstName, seat.lastName)}
                            </Avatar>
                            <Text size="sm" fw={500} ta="center" lineClamp={2}>
                              {seat.firstName} {seat.lastName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {seat.studentId}
                            </Text>
                          </Stack>
                        </Paper>
                      </Link>
                    ) : (
                      <Paper
                        shadow="sm"
                        p="md"
                        withBorder
                        style={{
                          width: 150,
                          height: 150,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text c="dimmed" size="sm">
                          Empty
                        </Text>
                      </Paper>
                    )}
                  </Grid.Col>
                ))}
              </Grid>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
