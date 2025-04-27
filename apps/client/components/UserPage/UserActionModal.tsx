import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { userService } from "@/services/user";
import { UserType } from "@/utils/types";
import { Loader2 } from "lucide-react"; // Optional loading spinner icon
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner"; // Optional toast notification
import { Button } from "../ui/button";

type UserActionModalProps = {
  role?: "ADMIN" | "MEMBER" | "RESELLER";
  type: "ban" | "promote";
  userId: string;
  setRequest: Dispatch<SetStateAction<UserType[]>>;
};

const UserActionModal = ({
  role,
  type,
  userId,
  setRequest,
}: UserActionModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      await userService.userAction({
        userId,
        role: role || undefined,
        type,
      });

      if (type === "promote" && role !== "RESELLER") {
        setRequest((prev) =>
          prev.map((user) =>
            user.user_id === userId
              ? { ...user, team_member_role: role || user.team_member_role }
              : user
          )
        );
      }

      setOpen(false);

      toast.success(
        `${type === "ban" ? "Banned" : "Promoted"} ${role} successfully!`
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
          {type === "ban" ? "Ban User" : `Promote User As ${role}`}
        </span>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "ban"
              ? "Are you sure you want to ban this user?"
              : `Are you sure you want to promote this user to ${role}?`}
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone.
            {type === "ban"
              ? " The user will lose access permanently."
              : " The user will gain elevated permissions."}
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

export default UserActionModal;
