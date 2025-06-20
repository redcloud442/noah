"use client";

import {
  ColumnFiltersState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  Header,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, RefreshCw, Search } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

import useUserDataStore from "@/lib/userDataStore";
import { ordersService } from "@/services/orders";
import { OrderType } from "@/utils/types";
import ReusableTable from "../ReusableTable/ReusableTable";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { OrderListColumn } from "./OrderListColumn";

import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";

type FilterFormValues = {
  search: string;
  dateFilter: { start: string; end: string };
};

const OrderListTable = () => {
  const { userData } = useUserDataStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [activePage, setActivePage] = useState(1);
  const [formValues, setFormValues] = useState<FilterFormValues>({
    search: "",
    dateFilter: {
      start: "",
      end: "",
    },
  });

  const queryKey = [
    "orders",
    formValues.search,
    formValues.dateFilter,
    activePage,
  ];

  const { register, getValues, handleSubmit, reset } =
    useForm<FilterFormValues>({
      defaultValues: {
        search: "",
        dateFilter: {
          start: undefined,
          end: undefined,
        },
      },
    });

  const { data, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      const { search, dateFilter } = getValues();
      return ordersService.getAllOrders({
        take: 15,
        skip: activePage,
        search,
        dateFilter,
        teamId: userData?.teamMemberProfile.team_member_team_id || "",
      });
    },
    enabled: !!userData?.teamMemberProfile.team_member_team_id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const { columns } = OrderListColumn(queryKey);

  const table = useReactTable({
    data: data?.orders || [],
    columns,
    manualFiltering: true,
    manualSorting: true,
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getExpandedRowModel: getExpandedRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const pageCount = Math.ceil((data?.count || 0) / 15);

  const onSubmit = (data: FilterFormValues) => {
    setFormValues(data);
  };

  const tableColumns = useMemo(() => {
    return table.getAllColumns().map((column) => {
      const header = column.columnDef.header;
      let columnLabel = column.id || "Unnamed Column";

      if (typeof header === "string") {
        columnLabel = header;
      } else if (typeof header === "function") {
        const renderedHeader = header({
          column,
          header: column.columnDef.header as unknown as Header<
            OrderType,
            unknown
          >,
          table,
        });

        if (React.isValidElement(renderedHeader)) {
          const props = renderedHeader.props as { children: string | string[] };
          if (typeof props.children === "string") {
            columnLabel = props.children;
          } else if (Array.isArray(props.children)) {
            columnLabel = props.children
              .map((child) => (typeof child === "string" ? child : ""))
              .join("");
          }
        }
      }

      return {
        label: columnLabel,
        accessorFn: column.id,
        getCanHide: column.getCanHide,
        getIsVisible: column.getIsVisible,
        toggleVisibility: column.toggleVisibility,
      };
    });
  }, [table]);

  const handleRefresh = () => {
    setActivePage(1);
    reset();
    setFormValues({
      search: "",
      dateFilter: {
        start: "",
        end: "",
      },
    });
    refetch();
  };

  return (
    <div className="w-full space-y-6">
      <Card className="w-full rounded-md p-6 shadow-lg">
        <div className="flex flex-wrap gap-6 items-start py-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 w-full max-w-2xl"
          >
            <div className="flex flex-wrap gap-4 items-center w-full">
              <Input
                {...register("search")}
                placeholder="Search by requestor..."
                className="max-w-sm p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="submit"
                disabled={isFetching}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <Search className="w-4 h-4" /> Search
              </Button>
              <Button
                onClick={handleRefresh}
                disabled={isFetching}
                size="sm"
                className="flex items-center gap-1 text-sm hover:text-black"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </Button>
            </div>
          </form>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto rounded-md">
                Columns <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="shadow-md">
              {tableColumns
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.accessorFn}
                      className="capitalize text-sm"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator className="my-4" />

        <ReusableTable
          table={table}
          columns={columns}
          activePage={activePage}
          totalCount={data?.count || 0}
          isFetchingList={isFetching}
          setActivePage={setActivePage}
          pageCount={pageCount}
        />
      </Card>
    </div>
  );
};

export default OrderListTable;
