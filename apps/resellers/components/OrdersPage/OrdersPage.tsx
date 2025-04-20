"use client";

import { ReusableMantineReactTable } from "@/components/ReusableTable/ReusableTable";
import { orderService } from "@/services/order";
import {
  Badge,
  Button,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_SortingState,
} from "mantine-react-table";
import { useEffect, useState } from "react";

type Order = {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  orderStatus: string;
};

const columns: MRT_ColumnDef<Order>[] = [
  { accessorKey: "orderNumber", header: "Order Number", enableSorting: true },
  { accessorKey: "customerName", header: "Customer Name", enableSorting: true },
  {
    accessorKey: "orderDate",
    header: "Order Date",
    enableSorting: true,
    Cell: ({ row }) => {
      return (
        <Text>{new Date(row.original.orderDate).toLocaleDateString()}</Text>
      );
    },
  },
  {
    accessorKey: "orderStatus",
    header: "Order Status",
    enableSorting: true,
    Cell: ({ row }) => {
      return (
        <Badge
          color={
            row.original.orderStatus === "PENDING"
              ? "yellow"
              : row.original.orderStatus === "PAID"
                ? "green"
                : row.original.orderStatus === "CANCELLED"
                  ? "red"
                  : "gray"
          }
        >
          {row.original.orderStatus}
        </Badge>
      );
    },
  },
];

export default function Page() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [count, setCount] = useState(0);
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [globalInput, setGlobalInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const sort = sorting[0] || {};

        const { data, count } = await orderService.getOrders({
          take: pagination.pageSize,
          skip: pagination.pageIndex,
          search: globalInput,
          sortDirection: sort?.desc ? "desc" : "asc",
          columnAccessor: sort?.id || "",
          dateFilter: {
            start: "",
            end: "",
          },
        });

        setOrders(data);
        setCount(count);
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Failed to fetch orders",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [sorting, pagination, globalFilter]);

  const table = useMantineReactTable({
    columns,
    data: orders,
    enableRowSelection: false,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    enableGlobalFilter: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    getRowId: (row) => `${row.orderNumber}`,
    rowCount: count,
    pageCount: Math.ceil(count / pagination.pageSize),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    renderTopToolbarCustomActions: () => (
      <Group gap="xs" px="md">
        <TextInput
          placeholder="Search orders..."
          value={globalInput}
          onChange={(e) => setGlobalInput(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setGlobalFilter(globalInput);
          }}
        />
        <Button
          onClick={() => setGlobalFilter(globalInput)}
          variant="default"
          size="sm"
        >
          Search
        </Button>
      </Group>
    ),
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      sorting,
    },
    initialState: {
      showColumnFilters: false,
      pagination: {
        pageIndex: 0,
        pageSize: 15,
      },
    },
  });

  return (
    <Container fluid p="md">
      <Stack>
        <Title order={2}>Orders Table</Title>
        <Text>
          This is a table of orders for the reseller. It shows the order number,
          the customer name, the order date, and the order status.
        </Text>
        <Divider my="sm" />
        <ReusableMantineReactTable table={table} />
      </Stack>
    </Container>
  );
}
