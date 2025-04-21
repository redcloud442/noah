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
import { Loader2 } from "lucide-react"; // Optional loading spinner icon
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner"; // Optional toast notification
import { Button } from "../ui/button";

type WithdrawalModalProps = {
  resellerId: string;
  withdrawalId: string;
  status: "APPROVED" | "REJECTED";
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

const WithdrawalModal = ({
  resellerId,
  withdrawalId,
  status,
  setRequest,
  setCacheData,
}: WithdrawalModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      await withdrawalService.withdrawalAction({
        resellerId,
        withdrawalId,
        status,
      });

      setRequest((prev) =>
        prev.map((withdrawal) =>
          withdrawal.reseller_withdrawal_id === withdrawalId
            ? { ...withdrawal, reseller_withdrawal_status: status }
            : withdrawal
        )
      );

      setCacheData((prev) => {
        const updatedCache = { ...prev };
        for (const key in updatedCache) {
          if (
            updatedCache[key].data.some(
              (item) => item.reseller_withdrawal_id === withdrawalId
            )
          ) {
            delete updatedCache[key];
          }
        }
        return updatedCache;
      });

      setOpen(false);

      toast.success(
        `${status === "APPROVED" ? "Approved" : "Rejected"} successfully!`
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
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
          <Button variant="outline" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAction} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalModal;
