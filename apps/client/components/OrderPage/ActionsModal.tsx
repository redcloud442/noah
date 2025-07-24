import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { emailSevice } from "@/services/email";
import { ordersService } from "@/services/orders";
import { OrderType } from "@/utils/types";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react"; // Optional loading spinner icon
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

type ActionsModalProps = {
  orderId: string;
  status: "SHIPPED";
  queryKey: QueryKey;
  toBeEmailed: string;
};

const ActionsModal = ({
  orderId,
  status,
  queryKey,
  toBeEmailed,
}: ActionsModalProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      return ordersService.updateOrderStatus({ orderId, status });
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<{
        orders: OrderType[];
        count: number;
      }>(queryKey);

      if (previousData) {
        queryClient.setQueryData(queryKey, (old: typeof previousData) => {
          if (!old) return old;

          const updatedData = old.orders.filter((item) =>
            item.order_id === orderId ? { ...item, order_status: status } : item
          );

          return { orders: updatedData, count: old.count };
        });
      }

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error("Something went wrong. Reverting changes.");
    },
    onSuccess: async () => {
      if (status === "SHIPPED") {
        await emailSevice.sendEmail({
          to: toBeEmailed,
          subject: "Your Order Has Been Shipped – Noir Clothing",
          text: `Your order has been shipped via our logistics partner and is on its way to you.`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
              <h2 style="color: #3B82F6; font-size: 24px;">Your Order is on the Way!</h2>
              <p style="font-size: 16px;">
                Great news! Your order from <strong>Noir Clothing</strong> has been shipped through our trusted logistics partner.
              </p>
              <br />
              <p style="font-size: 14px; color: #555;">
                If you have any questions or concerns, feel free to reply to this email or contact our support team.
              </p>
              <p style="font-weight: bold;">– The Noir Clothing Team</p>
            </div>
          `,
        });
      }

      toast.success(
        `${status === "SHIPPED" ? "Shipped" : "Rejected"} successfully!`
      );
      setOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const handleAction = () => {
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-sm cursor-pointer bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:text-white rounded-sm focus:bg-accent p-1 w-full"
        >
          {status === "SHIPPED" ? "PAID" : "REJECT"}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {status === "SHIPPED"
              ? "Are you sure you want to mark this order as shipped?"
              : "Are you sure you want to reject this withdrawal?"}
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone.
            {status === "SHIPPED"
              ? " The order will be marked as shipped."
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleAction} disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActionsModal;
