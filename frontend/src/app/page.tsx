import { Button, Center, Stack, Text } from "@mantine/core";
import Link from "next/link";

export default function Home() {
  return (
    <Center w={"100vw"} h={"100vh"}>
      <Stack>
        <Text>Attendance Monitoring System</Text>
        <Button component={Link} href={"/login"}>
          Login
        </Button>
        <Button component={Link} href={"/attendance-summary"}>
          Attendance Summary
        </Button>
      </Stack>
    </Center>
  );
}
