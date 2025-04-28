import { Button } from "@/components/ui/button";
import { formatDateToYYYYMMDD } from "@/utils/function";
import { WithdrawalType } from "@/utils/types";
import { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import WithdrawalModal from "./WithdrawalModal";

type WithdrawalColumnProps = {
  status: "PENDING" | "APPROVED" | "REJECTED";
  setRequest: Dispatch<SetStateAction<WithdrawalType[]>>;
  setCacheData: Dispatch<
    SetStateAction<{
      [key: string]: {
        data: WithdrawalType[];
        total: Record<string, number>;
      };
    }>
  >;
};
export const WithdrawalColumn = ({
  status,
  setRequest,
  setCacheData,
}: WithdrawalColumnProps) => {
  const columns: ColumnDef<WithdrawalType>[] = [
    {
      accessorKey: "reseller_withdrawal_reseller",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Reseller
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center hover:underline cursor-pointer">
          {row.getValue("reseller_withdrawal_reseller")}
        </div>
      ),
    },
    {
      accessorKey: "reseller_withdrawal_status",
      header: "Status",
      cell: ({ row }) => {
        return (
          <Badge
            className={`flex items-center justify-center capitalize text-white ${
              row.getValue("reseller_withdrawal_status") === "PENDING"
                ? "bg-yellow-500"
                : row.getValue("reseller_withdrawal_status") === "APPROVED"
                  ? "bg-green-500"
                  : "bg-red-500"
            }`}
          >
            {row.getValue("reseller_withdrawal_status")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "reseller_withdrawal_amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            ₱{" "}
            {(
              row.getValue("reseller_withdrawal_amount") as number
            ).toLocaleString()}
          </div>
        );
      },
    },
    {
      accessorKey: "reseller_withdrawal_created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Created <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("reseller_withdrawal_created_at") as Date;
        return (
          <div className="flex items-center justify-center gap-2 text-wrap w-full">
            <span>{formatDateToYYYYMMDD(value)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "reseller_withdrawal_bank_name",
      header: "Bank Name",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center uppercase">
            {row.getValue("reseller_withdrawal_bank_name")}
          </div>
        );
      },
    },
    {
      accessorKey: "reseller_withdrawal_account_number",
      header: "Account Number",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            {row.getValue("reseller_withdrawal_account_number")}
          </div>
        );
      },
    },
    {
      accessorKey: "reseller_withdrawal_account_name",
      header: "Account Name",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            {row.getValue("reseller_withdrawal_account_name")}
          </div>
        );
      },
    },
    {
      accessorKey: "action_by",
      header: "Action By",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            {row.getValue("action_by") ? row.getValue("action_by") : "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "reseller_withdrawal_updated_at",
      header: "Date Updated",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            {row.getValue("reseller_withdrawal_updated_at")
              ? formatDateToYYYYMMDD(
                  row.getValue("reseller_withdrawal_updated_at") as Date
                )
              : "N/A"}
          </div>
        );
      },
    },
    ...(status === "PENDING"
      ? [
          {
            header: "Actions",
            cell: ({ row }: { row: Row<WithdrawalType> }) => {
              const data = row.original;
              return (
                <div className="flex items-center justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="w-full flex items-center justify-center"
                      asChild
                    >
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>

                      <DropdownMenuSeparator />
                      <div className="flex flex-col space-y-1 items-start justify-center px-1">
                        {/* <UserActionModal
                    type="ban"
                    userId={user.user_id}
                    setRequest={setRequest}
                  /> */}

                        {data.reseller_withdrawal_status === "PENDING" && (
                          <WithdrawalModal
                            withdrawalId={data.reseller_withdrawal_id}
                            resellerId={data.reseller_withdrawal_reseller_id}
                            status={"APPROVED"}
                            setRequest={setRequest}
                            setCacheData={setCacheData}
                          />
                        )}

                        {data.reseller_withdrawal_status === "PENDING" && (
                          <WithdrawalModal
                            withdrawalId={data.reseller_withdrawal_id}
                            resellerId={data.reseller_withdrawal_reseller_id}
                            status={"REJECTED"}
                            setRequest={setRequest}
                            setCacheData={setCacheData}
                          />
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            },
          },
        ]
      : []),
  ];

  return {
    columns,
  };
};
