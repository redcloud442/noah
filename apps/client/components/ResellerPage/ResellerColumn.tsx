import { Button } from "@/components/ui/button";
import { formatDateToYYYYMMDD } from "@/utils/function";
import { UserType } from "@/utils/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import UserActionModal from "../UserPage/UserActionModal";

type ResellerColumnProps = {
  setRequest: Dispatch<SetStateAction<UserType[]>>;
};

export const ResellerColumn = ({ setRequest }: ResellerColumnProps) => {
  const router = useRouter();
  const { teamName } = useParams();

  const handleOrderNumberClick = (email: string) => {
    router.push(`/${teamName}/admin/user/${email}`);
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
                <div className="flex flex-col space-y-1 items-start justify-center px-1">
                  <UserActionModal
                    type="ban"
                    userId={user.user_id}
                    setRequest={setRequest}
                  />

                  {user.team_member_role !== "MEMBER" && (
                    <UserActionModal
                      type="promote"
                      userId={user.user_id}
                      role="MEMBER"
                      setRequest={setRequest}
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
