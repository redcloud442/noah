"use client";

import useUserDataStore from "@/lib/userDataStore";
import { dashboardService } from "@/services/dashboard";
import { typeDashboardSchema } from "@/utils/schema";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { CalendarIcon, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

type FormData = {
  dateFilter: {
    start: string;
    end: string;
  };
};

const DashboardAnalyticsPage = () => {
  const { userData } = useUserDataStore();
  const [dateFilter, setDateFilter] = useState<typeDashboardSchema>({
    dateFilter: {
      start: "",
      end: "",
    },
    teamId: userData?.teamMemberProfile.team_member_team_id ?? "",
  });

  const { handleSubmit, control } = useForm<FormData>({
    defaultValues: {
      dateFilter: {
        start: "",
        end: "",
      },
    },
  });
  console.log(userData);
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: [
      "dashboard",
      dateFilter.dateFilter.start,
      dateFilter.dateFilter.end,
    ],
    queryFn: () => {
      return dashboardService.get({
        dateFilter: {
          start: dateFilter.dateFilter.start,
          end: dateFilter.dateFilter.end,
        },
        teamId: userData?.teamMemberProfile.team_member_team_id ?? "",
      });
    },
    enabled: !!userData?.teamMemberProfile.team_member_team_id,
    staleTime: 1000 * 60 * 4,
    gcTime: 1000 * 60 * 4,
  });

  const handleOnSubmit = async (data: FormData) => {
    try {
      setDateFilter({
        dateFilter: {
          start: data.dateFilter.start,
          end: data.dateFilter.end,
        },
        teamId: userData?.teamMemberProfile.team_member_team_id ?? "",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update date filter");
      }
    }
  };

  const handleOnRefresh = async () => {
    try {
      setDateFilter({
        dateFilter: {
          start: "",
          end: "",
        },
        teamId: userData?.teamMemberProfile.team_member_team_id ?? "",
      });
      await refetch();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to refresh data");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header and Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor performance, sales, and withdrawals in real-time.
            </p>
          </div>
        </div>

        <Separator className="my-2" />

        <form
          onSubmit={handleSubmit(handleOnSubmit)}
          className="flex flex-wrap gap-2 justify-between items-end"
        >
          <div className="flex flex-wrap gap-2 items-end">
            <Controller
              name="dateFilter.start"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="font-normal justify-start rounded-md"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(new Date(field.value), "PPP")
                        : "Start Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date: Date | undefined) =>
                        field.onChange(date?.toISOString() || "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />

            <Controller
              name="dateFilter.end"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="font-normal justify-start rounded-md"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(new Date(field.value), "PPP")
                        : "End Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date: Date | undefined) =>
                        field.onChange(date?.toISOString() || "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />

            <Button type="submit">Submit</Button>
          </div>

          <Button type="button" variant="outline" onClick={handleOnRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </form>

        {data && !isLoading && !isRefetching && (
          <>
            {/* Sales Overview */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-muted-foreground tracking-tight">
                  Sales Overview
                </h2>
                <Badge variant="outline" className="text-xs">
                  Updated{" "}
                  {formatDistanceToNow(new Date(data.sales.currentDate))} ago
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Daily Sales",
                    value: `₱${data.sales.daily.toLocaleString()}`,
                    color: "bg-blue-600",
                  },
                  {
                    title: "Monthly Sales",
                    value: `₱${data.sales.monthly.toLocaleString()}`,
                    color: "bg-green-600",
                  },
                  {
                    title: "Total Sales",
                    value: `₱${data.sales.total.toLocaleString()}`,
                    color: "bg-purple-600",
                  },
                ].map((metric) => (
                  <Card
                    key={metric.title}
                    className="bg-card border border-border rounded-xl shadow-sm transition-all hover:shadow-lg hover:scale-[1.015]"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {metric.title}
                      </CardTitle>
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white ${metric.color}`}
                      >
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-foreground">
                        {metric.value}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Branch Info */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-muted-foreground tracking-tight">
                  Branch Info
                </h2>
                <Badge variant="outline" className="text-xs">
                  Updated{" "}
                  {formatDistanceToNow(new Date(data.sales.currentDate))} ago
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6">
                <Card className="bg-card border border-border rounded-xl shadow-sm transition-all hover:shadow-lg hover:scale-[1.015]">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Branches
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">
                      {data.branches.total}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Withdrawals */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-muted-foreground tracking-tight">
                  Withdrawal Overview
                </h2>
                <Badge variant="outline" className="text-xs">
                  Updated{" "}
                  {formatDistanceToNow(new Date(data.withdrawals.currentDate))}{" "}
                  ago
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Daily Withdrawals",
                    value: `₱${data.withdrawals.daily.toLocaleString()}`,
                    color: "bg-pink-500",
                  },
                  {
                    title: "Monthly Withdrawals",
                    value: `₱${data.withdrawals.monthly.toLocaleString()}`,
                    color: "bg-yellow-500",
                  },
                  {
                    title: "Total Withdrawals",
                    value: `₱${data.withdrawals.total.toLocaleString()}`,
                    color: "bg-red-600",
                  },
                ].map((metric) => (
                  <Card
                    key={metric.title}
                    className="bg-card border border-border rounded-xl shadow-sm transition-all hover:shadow-lg hover:scale-[1.015]"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {metric.title}
                      </CardTitle>
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white ${metric.color}`}
                      >
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-foreground">
                        {metric.value}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {(isLoading || isRefetching) && (
          <div className="space-y-10">
            {/* Skeleton Section: Sales */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-muted-foreground tracking-tight">
                  Sales Overview
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="w-full h-32 rounded-xl" />
                ))}
              </div>
            </div>

            {/* Skeleton Section: Branches */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-muted-foreground tracking-tight">
                  Branch Info
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <Skeleton className="w-full h-32 rounded-xl" />
              </div>
            </div>

            {/* Skeleton Section: Withdrawals */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-muted-foreground tracking-tight">
                  Withdrawal Overview
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="w-full h-32 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAnalyticsPage;
