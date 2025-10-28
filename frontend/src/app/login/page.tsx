import { Button, Center, Stack } from "@mantine/core";
import TeacherLoginForm from "./TeacherLoginForm";
import Link from "next/link";

export default function Login() {
  return (
    <Center w={"100vw"} h={"100vh"}>
      <Stack gap={"lg"}>
        <Button component={Link} href={"/"} maw={150}>
          Back
        </Button>
        <TeacherLoginForm />
      </Stack>
    </Center>
  );
}
