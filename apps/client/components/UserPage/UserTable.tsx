"use client";

import { formatDateToLocal } from "@/utils/function";
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
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

import useUserDataStore from "@/lib/userDataStore";
import { UserType } from "@/utils/types";
import ReusableTable from "../ReusableTable/ReusableTable";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { UserColumn } from "./UserColumn";

import { Separator } from "@/components/ui/separator";
import { userService } from "@/services/user";

type FilterFormValues = {
  search: string;
  dateFilter: { start: string; end: string };
  sortDirection: string;
  columnAccessor: string;
  take: number;
  skip: number;
};

const UserTable = () => {
  const { userData } = useUserDataStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [requestData, setRequestData] = useState<UserType[] | null>(null);
  const [activePage, setActivePage] = useState(1);
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [count, setCount] = useState(0);

  const fetchRequest = async (values?: FilterFormValues) => {
    try {
      if (!userData?.teamMemberProfile.team_member_team_id) return;
      setIsFetchingList(true);

      const { search, dateFilter } = values || getValues();

      const startDate = dateFilter.start
        ? new Date(dateFilter.start)
        : undefined;
      const formattedStartDate = startDate ? formatDateToLocal(startDate) : "";

      const { data, count } = await userService.getUserList({
        take: 15,
        skip: activePage,
        search,
        dateFilter: {
          start: formattedStartDate,
          end: formattedStartDate,
        },
        sortDirection: sorting[0]?.desc ? "desc" : "asc",
        columnAccessor: sorting[0]?.id || "user_email",
        teamId: userData.teamMemberProfile.team_member_team_id,
      });

      setRequestData(data);
      setCount(count);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("Failed to fetch withdrawal list");
      }
    } finally {
      setIsFetchingList(false);
    }
  };

  const { register, handleSubmit, getValues } = useForm<FilterFormValues>({
    defaultValues: {
      search: "",
      dateFilter: {
        start: undefined,
        end: undefined,
      },
    },
  });

  const { columns } = UserColumn();

  const table = useReactTable({
    data: requestData || [],
    columns,
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

  useEffect(() => {
    fetchRequest();
  }, [userData, activePage, sorting]);

  const pageCount = Math.ceil((count || 0) / 15);

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
            UserType,
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

  const handleFetch = async (data: FilterFormValues) => {
    try {
      setActivePage(1);
      fetchRequest(data);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const handleRefresh = async () => {
    setActivePage(1);
    fetchRequest();
  };

  return (
    <div className="w-full space-y-6">
      <Card className="w-full rounded-md p-6 shadow-lg">
        <div className="flex flex-wrap gap-6 items-start py-4">
          <form
            onSubmit={handleSubmit(handleFetch)}
            className="flex flex-col gap-4 w-full max-w-2xl"
          >
            <div className="flex flex-wrap gap-4 items-center w-full">
              <Input
                {...register("search")}
                placeholder="Search by user email or full name"
                className="max-w-sm p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="submit"
                disabled={isFetchingList}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <Search className="w-4 h-4" /> Search
              </Button>
              <Button
                disabled={isFetchingList}
                onClick={handleRefresh}
                type="button"
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
          totalCount={pageCount}
          isFetchingList={isFetchingList}
          setActivePage={setActivePage}
          pageCount={pageCount}
        />
      </Card>
    </div>
  );
};

export default UserTable;
