import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateToYYYYMMDD } from "@/utils/function";
import { UserType } from "@/utils/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import UserActionModal from "./UserActionModal";

type FilterFormValues = {
  search: string;
  dateFilter: { start?: string; end?: string };
  sortDirection: string;
  columnAccessor: string;
};
type UserColumnProps = {
  formValue: FilterFormValues;
  activePage: number;
};

export const UserColumn = ({ formValue, activePage }: UserColumnProps) => {
  const router = useRouter();
  const { teamName } = useParams();

  const handleOrderNumberClick = (userEmail: string) => {
    router.push(`/${teamName}/admin/user/${userEmail}`);
  };

  const handleCopyUserEmail = (userEmail: string) => {
    navigator.clipboard.writeText(userEmail);
    toast.success("User email copied to clipboard");
  };

  const columns: ColumnDef<UserType>[] = [
    {
      accessorKey: "user_email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User Email
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div
          onClick={() => handleOrderNumberClick(row.getValue("user_email"))}
          className="text-center hover:underline cursor-pointer"
        >
          {row.getValue("user_email")}
        </div>
      ),
    },

    {
      accessorKey: "user_first_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const lastName = row.original.user_last_name;
        return (
          <div className="flex items-center justify-center">
            {row.original.user_first_name} {lastName}
          </div>
        );
      },
    },
    {
      accessorKey: "team_member_role",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const role = row.getValue("team_member_role") as string;

        return (
          <div className="font-medium text-center">
            <Badge>{role}</Badge>
          </div>
        );
      },
    },

    {
      accessorKey: "user_created_at",
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
        const value = row.getValue("user_created_at") as Date;
        return (
          <div className="flex items-center justify-center gap-2 text-wrap w-full">
            <span>{formatDateToYYYYMMDD(value)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "order_count",
      header: "Order Count",
      cell: ({ row }) => {
        const orderCount = row.getValue("order_count") as number;
        return (
          <div className="flex items-center justify-center">
            <span>{orderCount}</span>
          </div>
        );
      },
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
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
                <DropdownMenuItem
                  onClick={() => handleCopyUserEmail(user.user_email)}
                >
                  Copy user email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View payment details</DropdownMenuItem>

                <div className="flex flex-col space-y-1 items-start justify-center px-1">
                  <UserActionModal
                    type="ban"
                    userId={user.user_id}
                    activePage={activePage}
                    formValue={formValue}
                  />
                  {user.team_member_role !== "RESELLER" && (
                    <UserActionModal
                      type="promote"
                      userId={user.user_id}
                      role="RESELLER"
                      activePage={activePage}
                      formValue={formValue}
                    />
                  )}

                  {user.team_member_role !== "MEMBER" && (
                    <UserActionModal
                      type="promote"
                      userId={user.user_id}
                      role="MEMBER"
                      activePage={activePage}
                      formValue={formValue}
                    />
                  )}

                  {user.team_member_role !== "ADMIN" && (
                    <UserActionModal
                      type="promote"
                      userId={user.user_id}
                      role="ADMIN"
                      activePage={activePage}
                      formValue={formValue}
                    />
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return {
    columns,
  };
};
