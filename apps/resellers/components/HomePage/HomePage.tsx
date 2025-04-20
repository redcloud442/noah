import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { IconLogin } from "@tabler/icons-react";

const HomePage = () => {
  return (
    <Stack align="center" justify="start" h="100vh">
      <Title order={1} ta="center" mt={100}>
        Welcome to the{" "}
        <Text
          inherit
          variant="gradient"
          component="span"
          gradient={{ from: "violet", to: "indigo" }}
        >
          Noir Reseller Dashboard
        </Text>
      </Title>

      <Text c="dimmed" ta="center" size="lg" maw={580} mx="auto" mt="md">
        Manage your product listings, view reseller commissions, track your
        orders, and grow your business — all in one place.
      </Text>

      <Center>
        <Button
          href="/auth/sign-in"
          component="a"
          leftSection={<IconLogin />}
          variant="gradient"
          px={32}
          gradient={{ from: "#111", to: "#232D5E", deg: 160 }}
          radius="xl"
          size="lg"
          mx="auto"
          mt="xl"
        >
          Sign In to Your Dashboard
        </Button>
      </Center>

      <Text c="dimmed" ta="center" size="sm" maw={580} mx="auto" mt="xl">
        Don&apos;t have an account? Contact our team to become an official Noir
        reseller and unlock exclusive access to premium products and tools.
      </Text>
    </Stack>
  );
};

export default HomePage;
