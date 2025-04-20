"use client";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table/styles.css";

import { Box, LoadingOverlay } from "@mantine/core";
import {
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_TableInstance,
} from "mantine-react-table";

type ReusableMantineReactTableProps<T extends Record<string, any>> = {
  table?: MRT_TableInstance<T>; // NEW: optional controlled table instance
  data?: T[]; // fallback for uncontrolled
  columns?: MRT_ColumnDef<T>[]; // fallback for uncontrolled
  isLoading?: boolean;
};

export function ReusableMantineReactTable<T extends Record<string, any>>({
  table,
  data,
  columns,
  isLoading,
}: ReusableMantineReactTableProps<T>) {
  return (
    <Box>
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <MantineReactTable table={table!} />
    </Box>
  );
}
