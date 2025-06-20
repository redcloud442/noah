import { Button } from "@/components/ui/button";
import { formatDateToYYYYMMDD } from "@/utils/function";
import { OrderType } from "@/utils/types";
import { QueryKey } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ClipboardCopy } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import ActionsModal from "./ActionsModal";

const statusColorMap: Record<string, string> = {
  PENDING: "bg-yellow-600 dark:bg-yellow-700 dark:text-white ",
  REJECTED: "bg-red-600 dark:bg-red-700 dark:text-white ",
  PAID: "bg-green-500 dark:bg-green-600 dark:text-white ",
  SHIPPED: "bg-orange-500 dark:bg-orange-600 dark:text-white ",
};

export const OrderListColumn = (queryKey: QueryKey) => {
  //   const handleUpdateStatus = async (
  //     status: string,
  //     requestId: string,
  //     note?: string
  //   ) => {
  //     try {
  //       setIsLoading(true);
  //       await updateWithdrawalStatus({ status, requestId, note, companyName });

  //       setRequestData((prev) => {
  //         if (!prev) return prev;

  //         // Extract PENDING data and filter out the item being updated
  //         const pendingData = prev.data["PENDING"]?.data ?? [];
  //         const updatedItem = pendingData.find(
  //           (item) => item.alliance_withdrawal_request_id === requestId
  //         );
  //         const newPendingList = pendingData.filter(
  //           (item) => item.alliance_withdrawal_request_id !== requestId
  //         );
  //         const currentStatusData = prev.data[status as keyof typeof prev.data];
  //         const hasExistingData = currentStatusData?.data?.length > 0;

  //         if (!updatedItem) return prev;

  //         return {
  //           ...prev,
  //           data: {
  //             ...prev.data,
  //             PENDING: {
  //               ...prev.data["PENDING"],
  //               data: newPendingList,
  //               count: Number(prev.data["PENDING"]?.count) - 1,
  //             },
  //             [status as keyof typeof prev.data]: {
  //               ...currentStatusData,
  //               data: hasExistingData
  //                 ? [
  //                     {
  //                       ...updatedItem,
  //                       alliance_withdrawal_request_status: status,
  //                     },
  //                     ...currentStatusData.data,
  //                   ]
  //                 : [],
  //               count: Number(currentStatusData?.count || 0) + 1,
  //             },
  //           },

  //           totalPendingWithdrawal:
  //             Number(prev.totalPendingWithdrawal || 0) -
  //             Number(
  //               updatedItem.alliance_withdrawal_request_amount -
  //                 updatedItem.alliance_withdrawal_request_fee
  //             ),
  //           totalApprovedWithdrawal:
  //             status === "APPROVED"
  //               ? (prev.totalApprovedWithdrawal || 0) +
  //                 updatedItem.alliance_withdrawal_request_amount
  //               : prev.totalApprovedWithdrawal || 0,
  //         };
  //       });
  //       reset();
  //       setIsOpenModal({ open: false, requestId: "", status: "" });
  //       toast.success(`Status Update`, {
  //         description: `${status} Request Successfully`,
  //       });
  //     } catch (e) {
  //       toast.error(`Status Failed`, {
  //         description: `Something went wrong`,
  //       });
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   const handleCopyToClipboard = (text: string, variant: string) => {
  //     navigator.clipboard.writeText(text);
  //     toast.success(`Copied to clipboard`, {
  //       description: `${variant} copied to clipboard`,
  //     });
  //   };

  //   const handleForReinvestment = async (params: {
  //     packageId: string;
  //     amount: number;
  //     memberId: string;
  //     requestId: string;
  //     status: string;
  //   }) => {
  //     try {
  //       setIsLoading(true);
  //       await packageForReinvestment(params);

  //       setRequestData((prev) => {
  //         if (!prev) return prev;

  //         // Extract PENDING data and filter out the item being updated
  //         const pendingData = prev.data["PENDING"]?.data ?? [];
  //         const updatedItem = pendingData.find(
  //           (item) => item.alliance_withdrawal_request_id === params.requestId
  //         );
  //         const newPendingList = pendingData.filter(
  //           (item) => item.alliance_withdrawal_request_id !== params.requestId
  //         );
  //         const currentStatusData = prev.data[status as keyof typeof prev.data];
  //         const hasExistingData = currentStatusData?.data?.length > 0;

  //         if (!updatedItem) return prev;

  //         return {
  //           ...prev,
  //           data: {
  //             ...prev.data,
  //             PENDING: {
  //               ...prev.data["PENDING"],
  //               data: newPendingList,
  //               count: Number(prev.data["PENDING"]?.count) - 1,
  //             },
  //             ["REINVESTED"]: {
  //               ...currentStatusData,
  //               data: hasExistingData
  //                 ? [
  //                     {
  //                       ...updatedItem,
  //                       alliance_withdrawal_request_status: status,
  //                       approver_username: profile.user_username,
  //                       alliance_withdrawal_request_date_updated: new Date(),
  //                     },
  //                     ...currentStatusData.data,
  //                   ]
  //                 : [],
  //               count: Number(currentStatusData?.count || 0) + 1,
  //             },
  //           },
  //         };
  //       });

  //       toast.success(`Reinvestment Success`);
  //     } catch (e) {
  //       toast.error(`Reinvestment Failed`, {
  //         description: `Something went wrong`,
  //       });
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  const router = useRouter();
  const { teamName } = useParams();

  const handleOrderNumberClick = (orderNumber: string) => {
    router.push(`/${teamName}/admin/orders/${orderNumber}`);
  };

  const columns: ColumnDef<OrderType>[] = [
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
          onClick={() => handleOrderNumberClick(row.getValue("order_number"))}
          className="text-center hover:underline cursor-pointer"
        >
          CN - {row.getValue("order_number")}
        </div>
      ),
    },
    {
      accessorKey: "order_status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("order_status") as string;
        const color = statusColorMap[status.toUpperCase()];
        return (
          <div className="flex items-center justify-center">
            <Badge className={`${color} text-black`}>{status}</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "order_payment_method",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Payment Method <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const paymentMethod = row.getValue("order_payment_method") as string;
        return (
          <div className="flex items-center justify-center uppercase">
            {paymentMethod}
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
          Amount <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("order_total"));

        const formatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount);
        return <div className="font-medium text-center">{formatted}</div>;
      },
    },

    {
      accessorKey: "order_email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User Email <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("order_email") as string;
        return (
          <div className="flex items-center justify-center gap-2 text-wrap w-full">
            <span>{value}</span>
            <Button
              size="icon"
              onClick={() => navigator.clipboard.writeText(value)}
              className="p-1 dark:bg-stone-900 dark:text-white"
            >
              <ClipboardCopy className="w-3 h-3" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "order_created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
        >
          Date Created <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {formatDateToYYYYMMDD(row.getValue("order_created_at"))}
        </div>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <>
            {data.order_status === "PAID" && (
              <div className="flex gap-2 justify-center">
                <ActionsModal
                  orderId={data.order_id}
                  status="SHIPPED"
                  queryKey={queryKey}
                />
              </div>
            )}
          </>
        );
      },
    },
  ];

  return {
    columns,
  };
};
