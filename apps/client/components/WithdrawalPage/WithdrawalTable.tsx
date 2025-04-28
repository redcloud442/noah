"use client";

import useUserDataStore from "@/lib/userDataStore";
import { formatDateToLocal } from "@/utils/function";
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
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { withdrawalService } from "@/services/withdrawal";
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
  take: number;
  skip: number;
};

const ResellerTable = () => {
  const { userData } = useUserDataStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [requestData, setRequestData] = useState<WithdrawalType[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [count, setCount] = useState<Record<string, number>>({});
  const [showFilters, setShowFilters] = useState(false);

  const [cacheData, setCacheData] = useState<{
    [key: string]: {
      data: WithdrawalType[];
      total: Record<string, number>;
    };
  }>({});

  const fetchRequest = useCallback(
    async (
      values?: FilterFormValues,
      refresh: boolean = false,
      tabValue?: string
    ) => {
      try {
        if (!userData?.teamMemberProfile.team_member_team_id) return;

        const { search, dateFilter, status } = values || getValues();
        const cacheKey = `${search}-${dateFilter.start}-${dateFilter.end}-${status}-${activePage}`;

        if (!refresh) {
          if (cacheData[cacheKey]) {
            setRequestData(cacheData[cacheKey].data);
            setCount(cacheData[cacheKey].total);

            return;
          }
        }

        setIsFetchingList(true);

        const startDate = dateFilter.start
          ? new Date(dateFilter.start)
          : undefined;

        const formattedStartDate = startDate
          ? formatDateToLocal(startDate)
          : "";

        const { data, total } = await withdrawalService.getWithdrawalList({
          take: 15,
          skip: activePage,
          search,
          dateFilter: {
            start: formattedStartDate,
            end: formattedStartDate,
          },
          sortDirection: sorting[0]?.desc ? "desc" : "asc",
          columnAccessor: sorting[0]?.id || "user_email",
          status: tabValue
            ? (tabValue as "PENDING" | "APPROVED" | "REJECTED")
            : (status as "PENDING" | "APPROVED" | "REJECTED"),
          teamId: userData.teamMemberProfile.team_member_team_id,
        });

        if (!refresh) {
          setCacheData((prev) => ({
            ...prev,
            [cacheKey]: { data, total },
          }));
        }

        setRequestData(data);
        setCount(total);
      } catch (e) {
        if (e instanceof Error) {
          toast.error(e.message);
        } else {
          toast.error("Failed to fetch withdrawal list");
        }
      } finally {
        setIsFetchingList(false);
      }
    },
    [userData, activePage, sorting]
  );

  const { register, handleSubmit, getValues, reset, control, setValue, watch } =
    useForm<FilterFormValues>({
      defaultValues: {
        search: "",
        status: "PENDING",
        dateFilter: {
          start: undefined,
          end: undefined,
        },
      },
    });

  const { columns } = WithdrawalColumn({
    status: watch("status") as "PENDING" | "APPROVED" | "REJECTED",
    setRequest: setRequestData,
    setCacheData,
  });

  const table = useReactTable<WithdrawalType>({
    data: requestData || [],
    columns: columns as ColumnDef<WithdrawalType>[],
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

  const tabValue = watch("status");

  const pageCount = Math.ceil((count[tabValue] || 0) / 15);

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
      fetchRequest(data);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const handleRefresh = async () => {
    setActivePage(1);

    reset();
    fetchRequest(undefined, true, tabValue);
  };

  const handleFilter = async () => {
    try {
      setActivePage(1);
      if (!showFilters) {
        reset();
      }
      fetchRequest();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const handleTabChange = (value: string) => {
    setValue("status", value);
    fetchRequest();
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
              PENDING ({count["PENDING"] || 0})
            </TabsTrigger>
            <TabsTrigger value="APPROVED">
              APPROVED ({count["APPROVED"] || 0})
            </TabsTrigger>
            <TabsTrigger value="REJECTED">
              REJECTED ({count["REJECTED"] || 0})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <ReusableTable
          table={table}
          columns={columns as ColumnDef<WithdrawalType>[]}
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

export default ResellerTable;
