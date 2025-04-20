"use client";

import { dashboardService } from "@/services/dashboard";
import useUserDataStore from "@/utils/store/userDataStore";
import {
  Badge,
  Button,
  Card,
  Container,
  CopyButton,
  Divider,
  Grid,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  rem,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { DashboardTable } from "./DashboardTable";
const DashboardPage = () => {
  const { userData } = useUserDataStore();

  const totalIncome =
    userData?.resellerProfile.reseller_withdrawable_earnings ?? 0;
  const currentBalance =
    userData?.resellerProfile.reseller_non_withdrawable_earnings ?? 0;

  const [sales, setSales] = useState({
    total: 0,
    today: 0,
  });

  const cardHeight = rem(220);

  const handleFetchDashboardData = async () => {
    try {
      if (!userData) return;

      const response = await dashboardService.getDashboardData();

      setSales({
        total: response.totalResellerSales,
        today: response.todayResellerSales,
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch dashboard data",
        color: "red",
      });
    }
  };

  useEffect(() => {
    handleFetchDashboardData();
  }, [userData]);

  return (
    <Container fluid py="xl" px="lg">
      <Title order={2} mb="xs">
        Reseller Dashboard
      </Title>

      <Stack gap="lg">
        <TextInput
          label="Referral Link"
          rightSectionWidth={100}
          pb={10}
          rightSection={
            <CopyButton
              value={`${process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://noir-clothing.com"}/shop?REFERRAL_CODE=${userData?.resellerProfile.reseller_code}`}
            >
              {({ copied, copy }) => (
                <Button
                  size="xs"
                  color={copied ? "teal" : "blue"}
                  onClick={copy}
                  radius="sm"
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </CopyButton>
          }
          value={`${process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://noir-clothing.com"}/shop?REFERRAL_CODE=${userData?.resellerProfile.reseller_code}`}
          readOnly
        />
        <Grid gutter="xl">
          {/* Income Card */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card
              withBorder
              shadow="md"
              radius="lg"
              padding="xl"
              style={{ minHeight: cardHeight }}
            >
              <Stack
                gap="xs"
                justify="space-between"
                style={{ height: "100%" }}
              >
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Total Income
                  </Text>
                  <Badge color="green" size="lg" variant="light">
                    All Time
                  </Badge>
                </Group>

                <Text fz={rem(32)} fw={700} c="blue">
                  ₱ {totalIncome.toLocaleString()}
                </Text>

                <Divider my="xs" />

                <Text size="xs" c="dimmed">
                  Amount of income available for withdrawal
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Balance Card */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card
              withBorder
              shadow="md"
              radius="lg"
              padding="xl"
              style={{ minHeight: cardHeight }}
            >
              <Stack
                gap="xs"
                justify="space-between"
                style={{ height: "100%" }}
              >
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Current Balance (Non-withdrawable)
                  </Text>
                  <Badge color="yellow" size="lg" variant="light">
                    In Transition
                  </Badge>
                </Group>

                <Text fz={rem(32)} fw={700} c="orange">
                  ₱ {currentBalance.toLocaleString()}
                </Text>

                <Divider my="xs" />

                <Text size="xs" c="dimmed">
                  Funds will be available for withdrawal after{" "}
                  <b>4 business days</b>
                  <br />
                  or can be used to <b>restock now</b>.
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Total Sales Card */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card
              withBorder
              shadow="md"
              radius="lg"
              padding="xl"
              style={{ minHeight: cardHeight }}
            >
              <Stack
                gap="xs"
                justify="space-between"
                style={{ height: "100%" }}
              >
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Total Sales
                  </Text>
                  <Badge color="blue" size="lg" variant="light">
                    Orders
                  </Badge>
                </Group>

                <Text fz={rem(32)} fw={700} c="teal">
                  {sales.total} Orders
                </Text>

                <Divider my="xs" />

                <Text size="xs" c="dimmed">
                  Total completed sales from all time
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Sales Per Day Card */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card
              withBorder
              shadow="md"
              radius="lg"
              padding="xl"
              style={{ minHeight: cardHeight }}
            >
              <Stack
                gap="xs"
                justify="space-between"
                style={{ height: "100%" }}
              >
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Sales Per Day
                  </Text>
                  <Badge color="cyan" size="lg" variant="light">
                    Daily Avg.
                  </Badge>
                </Group>

                <Text fz={rem(32)} fw={700} c="indigo">
                  {sales.today} day
                </Text>

                <Divider my="xs" />

                <Text size="xs" c="dimmed">
                  Based on the last 7 days of sales activity
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
        <DashboardTable />
      </Stack>
    </Container>
  );
};

export default DashboardPage;
