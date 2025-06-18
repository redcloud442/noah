"use client";

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
import { ChevronDown, RefreshCw, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

import useUserDataStore from "@/lib/userDataStore";
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
import { useQuery } from "@tanstack/react-query";

type FilterFormValues = {
  search: string;
  dateFilter: { start?: string; end?: string };
  sortDirection: string;
  columnAccessor: string;
};

const UserTable = () => {
  const { userData } = useUserDataStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [activePage, setActivePage] = useState(1);

  const [formValue, setFormValue] = useState<FilterFormValues>({
    search: "",
    sortDirection: "asc",
    columnAccessor: "user_email",
    dateFilter: { start: "", end: "" },
  });

  const { register, handleSubmit, getValues } = useForm<FilterFormValues>({
    defaultValues: {
      search: "",
      dateFilter: {
        start: undefined,
        end: undefined,
      },
    },
  });

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["users", formValue.search, activePage],
    queryFn: () => {
      const { search, dateFilter, sortDirection, columnAccessor } = getValues();
      return userService.getUserList({
        take: 15,
        skip: activePage,
        search,
        dateFilter,
        sortDirection,
        teamId: userData?.teamMemberProfile.team_member_team_id,
        columnAccessor,
      });
    },
    enabled: !!userData?.teamMemberProfile.team_member_team_id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const { columns } = useMemo(
    () => UserColumn({ formValue, activePage }),
    [formValue, activePage]
  );

  const table = useReactTable({
    data: data?.data || [],
    columns,
    onSortingChange: setSorting,
    manualFiltering: true,
    manualSorting: true,
    autoResetPageIndex: false,
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

  const tableColumns = useMemo(() => {
    return table
      .getAllColumns()
      .filter((column) => column.getCanHide())
      .map((column) => {
        const header = column.columnDef.header;
        let columnLabel = column.id;

        if (typeof header === "string") {
          columnLabel = header;
        }
        // Skip complex header parsing unless absolutely needed

        return {
          label: columnLabel,
          accessorFn: column.id,
          getCanHide: column.getCanHide,
          getIsVisible: column.getIsVisible,
          toggleVisibility: column.toggleVisibility,
        };
      });
  }, [table.getAllColumns()]);

  const handleFetch = useCallback(
    async (data: FilterFormValues) => {
      setFormValue(data);
    },
    [setFormValue]
  );

  const handleRefresh = async () => {
    setActivePage(1);
    refetch();
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
                disabled={isFetching}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <Search className="w-4 h-4" /> Search
              </Button>
              <Button
                disabled={isFetching}
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
          isFetchingList={isFetching}
          setActivePage={setActivePage}
          pageCount={pageCount}
        />
      </Card>
    </div>
  );
};

export default UserTable;
