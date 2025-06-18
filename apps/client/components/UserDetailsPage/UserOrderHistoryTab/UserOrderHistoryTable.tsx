"use client";

import { Card } from "@/components/ui/card";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";

import ReusableTable from "@/components/ReusableTable/ReusableTable";

import { useOrderQueryAdmin } from "@/query/orderQuery";
import { UserOrderHistoryColumn } from "./UserOrderHistoryColumn";
type UserOrderHistoryTableProps = {
  userId: string;
};

const UserOrderHistoryTable = ({ userId }: UserOrderHistoryTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [activePage, setActivePage] = useState(1);

  const { data, isLoading } = useOrderQueryAdmin(15, activePage, userId);

  const requestData = data?.orders || [];
  const count = data?.count || 0;

  const { columns } = UserOrderHistoryColumn();

  const table = useReactTable({
    data: requestData || [],
    columns,
    onSortingChange: setSorting,
    manualFiltering: true,
    enableSorting: true,
    enableColumnResizing: true,
    enableColumnPinning: true,
    enableGlobalFilter: true,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getExpandedRowModel: getExpandedRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const pageCount = Math.ceil((count || 0) / 15);

  return (
    <div className="w-full space-y-6">
      <Card className="w-full rounded-md p-6 shadow-lg">
        <ReusableTable
          table={table}
          columns={columns}
          activePage={activePage}
          totalCount={pageCount}
          isFetchingList={isLoading}
          setActivePage={setActivePage}
          pageCount={pageCount}
        />
      </Card>
    </div>
  );
};

export default UserOrderHistoryTable;
