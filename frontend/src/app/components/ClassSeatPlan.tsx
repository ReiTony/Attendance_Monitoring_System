"use client";

import { useClassSeatPlan } from "@/hooks/classSeatPlan/useClassSeatPlan";
import {
  Avatar,
  Box,
  Center,
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

  // Calculate the grid dimensions (starting from 1)
  const maxRow = Math.max(...classSeatPlan.map((seat) => seat.seatRow), 1);
  const maxCol = Math.max(...classSeatPlan.map((seat) => seat.seatCol), 1);

  // Create a 2D grid to place students (starting from index 1)
  const seatGrid: ((typeof classSeatPlan)[0] | null)[][] = Array.from(
    { length: maxRow + 1 },
    () => Array(maxCol + 1).fill(null)
  );

  // Populate the grid with students
  classSeatPlan.forEach((seat) => {
    if (seat.seatRow >= 1 && seat.seatCol >= 1) {
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

        <Box style={{ overflowX: "auto", width: "100%" }}>
          <Stack gap="md">
            {seatGrid.slice(1).map((row, rowIndex) => (
              <Box
                key={rowIndex + 1}
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  flexWrap: "nowrap",
                  minWidth: "fit-content",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                }}
              >
                {row.slice(1).map((seat, colIndex) => (
                  <Box key={colIndex + 1}>
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
                  </Box>
                ))}
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
