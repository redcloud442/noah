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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react"; // Optional loading spinner icon
import { useState } from "react";
import { toast } from "sonner"; // Optional toast notification
import { Button } from "../ui/button";

type FilterFormValues = {
  search: string;
  dateFilter: { start?: string; end?: string };
  sortDirection: string;
  columnAccessor: string;
};

type UserActionModalProps = {
  role?: "ADMIN" | "MEMBER" | "RESELLER";
  type: "ban" | "promote";
  userId: string;
  formValue: FilterFormValues;
  activePage: number;
};

const UserActionModal = ({
  role,
  type,
  userId,
  formValue,
  activePage,
}: UserActionModalProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const queryKey = ["users", formValue.search, activePage];
  const resellerQueryKey = ["reseller", formValue.search, activePage];

  const { mutate, isPending } = useMutation({
    mutationFn: (data: {
      userId: string;
      role?: "ADMIN" | "MEMBER" | "RESELLER";
      type: "ban" | "promote";
    }) => userService.userAction(data),
    onMutate: (data) => {
      const { userId, role, type } = data;

      queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      if (previousData) {
        queryClient.setQueryData(queryKey, (old: { data: UserType[] }) => {
          return {
            ...old,
            data: old.data.map((user: UserType) => {
              if (user.user_id === userId) {
                return {
                  ...user,
                  team_member_role:
                    type === "ban" ? "MEMBER" : role || user.team_member_role,
                };
              }
              return user;
            }),
          };
        });
      }

      return { previousData };
    },

    onSuccess: () => {
      toast.success(
        `${type === "ban" ? "Banned" : "Promoted"} ${role} successfully!`
      );
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong.");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: resellerQueryKey });

      setOpen(false);
    },
  });

  const handleAction = () => {
    mutate({ userId, role, type });
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
          <Button variant="outline" disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleAction} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserActionModal;
