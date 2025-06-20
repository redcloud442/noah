"use client";

import { dashboardService } from "@/services/dashboard";
import useTransactionStore from "@/utils/store/useTransactionStore";
import {
  Badge,
  Card,
  Group,
  LoadingOverlay,
  Pagination,
  Paper,
  ScrollArea,
  Table,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";

export const DashboardTable = () => {
  const [activePage, setActivePage] = useState(1);
  const [count, setCount] = useState(15);
  const [isLoading, setIsLoading] = useState(false);

  const { transactionData, setTransactionData } = useTransactionStore();

  const handlePageChange = async () => {
    try {
      setIsLoading(true);
      const { data, total } =
        await dashboardService.getDashboardDataTransactions({
          take: 15,
          skip: activePage,
        });

      setTransactionData(data);
      setCount(total);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch dashboard data",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handlePageChange();
  }, [activePage]);

  const totalPages = Math.ceil((count ?? 0) / 15);

  return (
    <Paper withBorder shadow="sm" radius="lg" p="lg" mt="lg">
      {isLoading && <LoadingOverlay visible={isLoading} />}
      <Title order={3} mb="md">
        Transaction History
      </Title>

      <Card withBorder shadow="sm" radius="lg" padding="lg">
        <ScrollArea>
          <Table
            highlightOnHover
            stickyHeaderOffset={60}
            verticalSpacing="md" // makes row height consistent
            horizontalSpacing="md" // makes columns evenly spaced
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: "25%" }}>Date</Table.Th>
                <Table.Th style={{ width: "25%" }}>Type</Table.Th>
                <Table.Th style={{ width: "25%" }}>Amount</Table.Th>
                <Table.Th style={{ width: "25%" }}>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {transactionData?.map((tx) => (
                <Table.Tr key={tx.reseller_transaction_id}>
                  <Table.Td>
                    {new Date(
                      tx.reseller_transaction_created_at
                    ).toLocaleDateString()}
                  </Table.Td>
                  <Table.Td
                    style={{
                      textTransform: "lowercase",
                    }}
                  >
                    {tx.reseller_transaction_type}
                  </Table.Td>
                  <Table.Td>
                    ₱{tx.reseller_transaction_amount.toLocaleString()}
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={
                        tx.reseller_transaction_status === "APPROVED"
                          ? "green"
                          : tx.reseller_transaction_status === "REJECTED"
                            ? "red"
                            : tx.reseller_transaction_status === "ONGOING"
                              ? "yellow"
                              : "gray"
                      }
                      variant="light"
                    >
                      {tx.reseller_transaction_status}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>

            <Table.Caption>
              Recent activity from your reseller account
            </Table.Caption>
          </Table>
        </ScrollArea>
        <Group justify="flex-end">
          <Pagination
            total={totalPages}
            value={activePage}
            onChange={(value) => setActivePage(value)}
          />
        </Group>
      </Card>
    </Paper>
  );
};
