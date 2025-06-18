"use client";

import useUserDataStore from "@/lib/userDataStore";
import { WithdrawalType } from "@/utils/types";
import {
  ColumnDef,
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
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, RefreshCw, Search } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import ReusableTable from "../ReusableTable/ReusableTable";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";

import { Separator } from "@/components/ui/separator";
import { getWithdrawalQueryKey } from "@/lib/utils";
import { withdrawalService } from "@/services/withdrawal";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "../ui/calendar";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Switch } from "../ui/switch";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { WithdrawalColumn } from "./WithdrawalColumn";

type FilterFormValues = {
  search: string;
  dateFilter: { start: string; end: string };
  status: string;
  sortDirection: string;
  columnAccessor: string;
};

const ResellerTable = () => {
  const { userData } = useUserDataStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [activePage, setActivePage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [formValues, setFormValues] = useState<FilterFormValues>({
    search: "",
    status: "PENDING",
    dateFilter: { start: "", end: "" },
    sortDirection: "asc",
    columnAccessor: "user_email",
  });

  const { control, register, handleSubmit, watch, reset, getValues, setValue } =
    useForm<FilterFormValues>({
      defaultValues: {
        search: "",
        status: "PENDING",
        dateFilter: { start: "", end: "" },
      },
    });

  const teamId = userData?.teamMemberProfile?.team_member_team_id || "";
  const sort = sorting[0]?.desc ? "desc" : "asc";
  const column = sorting[0]?.id || "user_email";

  const status = watch("status");
  const {
    data: withdrawalData,
    isFetching: isFetchingList,
    refetch,
  } = useQuery({
    queryKey: getWithdrawalQueryKey({
      search: formValues.search,
      dateStart: formValues.dateFilter.start,
      dateEnd: formValues.dateFilter.end,
      status: status,
      activePage: activePage,
      sort,
      column,
      teamId,
    }),
    queryFn: () => {
      const { search, dateFilter, status } = getValues();
      return withdrawalService.getWithdrawalList({
        take: 15,
        skip: activePage,
        search,
        dateFilter: { start: dateFilter.start, end: dateFilter.end },
        sortDirection: sort,
        columnAccessor: column,
        status: status as "PENDING" | "APPROVED" | "REJECTED",
        teamId,
      });
    },
    enabled: Boolean(teamId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const { columns } = WithdrawalColumn({
    status: watch("status") as "PENDING" | "APPROVED" | "REJECTED",
    queryKey: getWithdrawalQueryKey({
      search: formValues.search,
      dateStart: formValues.dateFilter.start,
      dateEnd: formValues.dateFilter.end,
      status: status,
      activePage: activePage,
      sort,
      column,
      teamId,
    }),
  });

  const table = useReactTable<WithdrawalType>({
    data: withdrawalData?.data || [],
    columns: columns as ColumnDef<WithdrawalType>[],
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

  const pageCount = Math.ceil((withdrawalData?.count || 0) / 15);

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
            WithdrawalType,
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

  const handleSwitchChange = (checked: boolean) => {
    setShowFilters(checked);
    if (!checked) {
      reset();
      handleRefresh();
    }
  };

  const handleFetch = async (data: FilterFormValues) => {
    try {
      setActivePage(1);
      setFormValues(data);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const handleRefresh = async () => {
    setActivePage(1);

    reset();
    setFormValues({
      search: "",
      status: "PENDING",
      dateFilter: { start: "", end: "" },
      sortDirection: "asc",
      columnAccessor: "user_email",
    });
    refetch();
  };

  const handleFilter = async () => {
    try {
      setActivePage(1);
      refetch();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const handleTabChange = (value: string) => {
    setValue("status", value as "PENDING" | "APPROVED" | "REJECTED");
  };

  return (
    <div className="w-full space-y-6">
      <Card className="w-full rounded-md p-6 shadow-lg space-y-4">
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
              <div className="flex items-center space-x-2">
                <Switch
                  id="filter-switch"
                  checked={showFilters}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="filter">Filter</Label>
              </div>

              {showFilters && (
                <div className="flex flex-wrap gap-2 items-center rounded-md ">
                  <Controller
                    name="dateFilter.start"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="font-normal justify-start h-12 rounded-md"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(new Date(field.value), "PPP")
                              : "Select Start Date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date: Date | undefined) =>
                              field.onChange(date?.toISOString() || "")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />

                  {/* End Date Picker */}

                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isFetchingList}
                    onClick={handleFilter}
                    className="h-12 rounded-md"
                  >
                    Submit
                  </Button>
                </div>
              )}
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
        <Tabs
          defaultValue="PENDING"
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList>
            <TabsTrigger value="PENDING">
              PENDING ({withdrawalData?.total?.PENDING || 0})
            </TabsTrigger>
            <TabsTrigger value="APPROVED">
              APPROVED ({withdrawalData?.total?.APPROVED || 0})
            </TabsTrigger>
            <TabsTrigger value="REJECTED">
              REJECTED ({withdrawalData?.total?.REJECTED || 0})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <ReusableTable
          table={table}
          columns={columns as ColumnDef<WithdrawalType>[]}
          activePage={activePage}
          totalCount={withdrawalData?.total[status] || 0}
          isFetchingList={isFetchingList}
          setActivePage={setActivePage}
          pageCount={pageCount}
        />
      </Card>
    </div>
  );
};

export default ResellerTable;
