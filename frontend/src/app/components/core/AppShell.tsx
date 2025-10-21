import { Teacher } from "@/domain/teacher";
import {
  AppShell as MAppShell,
  Group,
  Burger,
  Title,
  Text,
  UnstyledButton,
  Avatar,
  Stack,
  NavLink,
} from "@mantine/core";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

const navItemsList = [
  {
    id: 1,
    label: "Class Schedule",
    route: "/upload",
  },
  {
    id: 2,
    label: "Attendance Logs",
    route: "/attendance-logs",
  },
  {
    id: 3,
    label: "Class Seat Plan",
    route: "/class-seat-plan",
  },
];

const routeChecker = (route: string, currentPath: string) => {
  if (currentPath.includes(route)) return true;
  else return false;
};

const AppShell = ({
  children,
  teacher,
}: {
  children: ReactNode;
  teacher: Teacher;
}) => {
  const pathname = usePathname();
  const [opened, setOpened] = useState(false);

  return (
    <MAppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <MAppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={opened}
            onClick={() => setOpened((o) => !o)}
            hiddenFrom="sm"
            size="sm"
          />
          <Title order={3}>Attendance Monitoring System</Title>
        </Group>
      </MAppShell.Header>

      <MAppShell.Navbar p="md">
        <MAppShell.Section mb="md">
          <UnstyledButton>
            <Group>
              <Avatar color="blue" radius="xl">
                TC
              </Avatar>
              <div>
                <Text size="sm" fw={500}>
                  {teacher.first_name + " " + teacher.last_name}
                </Text>
                <Text c="dimmed" size="xs">
                  {teacher.email}
                </Text>
              </div>
            </Group>
          </UnstyledButton>
        </MAppShell.Section>

        <MAppShell.Section grow>
          <Stack gap={8}>
            {navItemsList.map((item) => (
              <NavLink
                key={item.id}
                label={item.label}
                href={item.route}
                active={routeChecker(item.route, pathname)}
              />
            ))}
          </Stack>
        </MAppShell.Section>

        <MAppShell.Section>
          <Text size="xs" c="dimmed" ta="center" py="md">
            © 2025 Attendance Monitoring System
          </Text>
        </MAppShell.Section>
      </MAppShell.Navbar>

      <MAppShell.Main>{children}</MAppShell.Main>
    </MAppShell>
  );
};
export default AppShell;
