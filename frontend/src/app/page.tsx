"use client";

import { Button, Center, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { useState } from "react";
import RecordAttendanceModal from "./components/RecordAttendanceModal";

export default function Home() {
  const [modalOpened, setModalOpened] = useState(false);

  return (
    <>
      <RecordAttendanceModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
      />

      <Center w={"100vw"} h={"100vh"}>
        <Stack>
          <Text>Attendance Monitoring System</Text>

          <Button onClick={() => setModalOpened(true)}>
            Record Attendance
          </Button>

          <Button component={Link} href={"/login"}>
            Login
          </Button>
          <Button component={Link} href={"/attendance-summary"}>
            Attendance Summary
          </Button>
        </Stack>
      </Center>
    </>
  );
}
