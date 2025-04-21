import { withdrawalService } from "@/services/withdrawal";
import { formatDateToLocal } from "@/utils/function";

export const fetchWithdrawalList = async (
  key: string,
  {
    search,
    status,
    dateFilter,
    sorting,
    activePage,
    teamId,
  }: {
    search?: string;
    status?: string;
    dateFilter: {
      start?: string;
      end?: string;
    };
    sorting: Array<{
      desc?: boolean;
      id?: string;
    }>;
    activePage: number;
    teamId?: string;
  }
) => {
  const formattedStartDate = dateFilter.start
    ? formatDateToLocal(new Date(dateFilter.start))
    : undefined;
  const formattedEndDate = dateFilter.end
    ? formatDateToLocal(new Date(dateFilter.end))
    : undefined;

  return withdrawalService.getWithdrawalList({
    take: 15,
    skip: activePage,
    search,
    dateFilter: {
      start: formattedStartDate,
      end: formattedEndDate,
    },
    sortDirection: sorting[0]?.desc ? "desc" : "asc",
    columnAccessor: sorting[0]?.id || "user_email",
    status: status as "PENDING" | "APPROVED" | "REJECTED",
    teamId: teamId as string,
  });
};
