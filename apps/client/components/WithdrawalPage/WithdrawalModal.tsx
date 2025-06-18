import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { withdrawalService } from "@/services/withdrawal";
import { WithdrawalType } from "@/utils/types";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react"; // Optional loading spinner icon
import { useState } from "react";
import { toast } from "sonner"; // Optional toast notification
import { Button } from "../ui/button";

type WithdrawalModalProps = {
  resellerId: string;
  withdrawalId: string;
  status: "APPROVED" | "REJECTED";
  queryKey: QueryKey;
};

const WithdrawalModal = ({
  resellerId,
  withdrawalId,
  status,
  queryKey,
}: WithdrawalModalProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      withdrawalService.withdrawalAction({
        resellerId,
        withdrawalId,
        status,
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<{
        data: WithdrawalType[];
        total: Record<string, number>;
      }>(queryKey);

      if (previousData) {
        queryClient.setQueryData(queryKey, (old: typeof previousData) => {
          if (!old) return old;

          const updatedData = old.data.filter((item) =>
            item.reseller_withdrawal_id === withdrawalId
              ? { ...item, reseller_withdrawal_status: status }
              : item
          );

          const updatedTotal = {
            ...old.total,
            [status]: (old.total[status] ?? 0) + 1,
            PENDING: (old.total.PENDING ?? 0) - 1,
          };

          return { data: updatedData, total: updatedTotal };
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
    onSuccess: () => {
      toast.success(
        `${status === "APPROVED" ? "Approved" : "Rejected"} successfully!`
      );
      setOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
    },
  });

  const handleAction = () => {
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="text-sm cursor-pointer hover:bg-neutral-800 rounded-sm focus:bg-accent p-1 w-full">
          {status === "APPROVED" ? "Approve" : "Reject"}
        </span>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {status === "APPROVED"
              ? "Are you sure you want to approve this withdrawal?"
              : "Are you sure you want to reject this withdrawal?"}
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone.
            {status === "APPROVED"
              ? " The withdrawal will be processed."
              : " The withdrawal will be rejected."}
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

export default WithdrawalModal;
