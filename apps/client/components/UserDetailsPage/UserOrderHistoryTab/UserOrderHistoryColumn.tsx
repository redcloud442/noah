import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateToYYYYMMDD, pesoSignedNumber } from "@/utils/function";
import { order_table } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export const UserOrderHistoryColumn = () => {
  const router = useRouter();
  const { teamName } = useParams();
  const columns: ColumnDef<order_table>[] = [
    {
      accessorKey: "order_number",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order Number
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div
          onClick={() => {
            router.push(
              `/${teamName}/admin/orders/${row.original.order_number}`
            );
          }}
          className="text-center hover:underline cursor-pointer"
        >
          CN - {row.getValue("order_number")}
        </div>
      ),
    },

    {
      accessorKey: "order_created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order Date <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const orderDate = row.original.order_created_at;
        return (
          <div className="flex items-center justify-center">
            {formatDateToYYYYMMDD(orderDate)}
          </div>
        );
      },
    },
    {
      accessorKey: "order_status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order Status <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("order_status") as string;

        return (
          <div className="font-medium text-center">
            <Badge
              className={`${
                status === "PAID"
                  ? "bg-green-500"
                  : status === "PENDING"
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
            >
              {status}
            </Badge>
          </div>
        );
      },
    },

    {
      accessorKey: "order_total",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order Total <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("order_total") as number;
        return (
          <div className="flex items-center justify-center gap-2 text-wrap w-full">
            <span>{pesoSignedNumber(value)}</span>
          </div>
        );
      },
    },
  ];

  return {
    columns,
  };
};
