import type { Prisma } from "@prisma/client";
import prisma from "../../utils/prisma.js";

export const getUserModel = async (params: {
  userId: string;
  activeTeamId: string;
}) => {
  const userData = await prisma.user_table.findUnique({
    where: {
      user_id: params.userId,
    },
    select: {
      user_id: true,
      user_email: true,
      user_first_name: true,
      user_last_name: true,
    },
  });

  const teamMemberProfile = await prisma.team_member_table.findFirst({
    where: {
      team_member_user_id: params.userId,
      team_member_active_team_id: params.activeTeamId,
    },
    select: {
      team_member_id: true,
      team_member_role: true,
      team_member_team_id: true,
      team_member_date_created: true,
      team_member_team: {
        select: {
          team_id: true,
          team_name: true,
          team_date_created: true,
        },
      },

      team_member_team_group: {
        select: {
          team_group_member_id: true,
          team_group_member_date_created: true,
          team_group_member_team_member: {
            select: {
              team_member_id: true,
              team_member_role: true,
              team_member_team_id: true,
            },
          },
        },
      },
    },
  });

  const formattedTeamMemberProfile = {
    team_member_id: teamMemberProfile?.team_member_id,
    team_member_role: teamMemberProfile?.team_member_role,
    team_member_team_id: teamMemberProfile?.team_member_team_id,
    team_member_team: teamMemberProfile?.team_member_team.team_name,
    team_member_team_group: teamMemberProfile?.team_member_team_group.map(
      (teamGroup: {
        team_group_member_id: string;
        team_group_member_date_created: Date;
        team_group_member_team_member: {
          team_member_id: string;
          team_member_role: string;
          team_member_team_id: string;
        };
      }) => ({
        team_group_member_id: teamGroup.team_group_member_id,
        team_group_member_date_created:
          teamGroup.team_group_member_date_created,
        team_group_member_team_member: teamGroup.team_group_member_team_member,
      })
    ),
    team_member_date_created: teamMemberProfile?.team_member_date_created,
    team_member_active_team_id: params.activeTeamId,
  };

  const data = {
    userProfile: userData,
    teamMemberProfile: formattedTeamMemberProfile,
  };

  return data;
};

export const getUserListModel = async (params: {
  search: string;
  dateFilter: { start: string; end: string };
  columnAccessor: string;
  sortDirection: "asc" | "desc";
  take: number;
  skip: number;
  teamId: string;
}) => {
  const {
    search,
    dateFilter,
    columnAccessor,
    sortDirection,
    take,
    skip,
    teamId,
  } = params;

  const filter: Prisma.user_tableWhereInput = {};
  const orderBy: Record<string, string> = {};

  if (search) {
    filter.OR = [
      { user_email: { contains: search, mode: "insensitive" } },
      { user_first_name: { contains: search, mode: "insensitive" } },
      { user_last_name: { contains: search, mode: "insensitive" } },
    ];
  }

  if (dateFilter.start && dateFilter.end) {
    filter.user_created_at = {
      gte: new Date(dateFilter.start),
      lte: new Date(dateFilter.end),
    };
  }
  if (columnAccessor) {
    orderBy[columnAccessor] = sortDirection;
  }

  if (teamId) {
    filter.team_member_table = {
      some: {
        team_member_team_id: teamId,
      },
    };
  }
  const users = await prisma.user_table.findMany({
    where: filter,
    select: {
      user_id: true,
      user_email: true,
      user_first_name: true,
      user_last_name: true,
      user_created_at: true,
      _count: {
        select: {
          order_table: {
            where: {
              order_status: "PAID", // Only count PAID orders
            },
          },
        },
      },
      team_member_table: {
        where: {
          team_member_active_team_id: teamId,
        },
        select: {
          team_member_id: true,
          team_member_team_id: true,
          team_member_role: true,
        },
      },
    },
    orderBy: orderBy,
    take,
    skip,
  });

  const formattedUsers = users.map((user) => ({
    user_id: user.user_id,
    user_email: user.user_email,
    user_first_name: user.user_first_name,
    user_last_name: user.user_last_name,
    user_created_at: user.user_created_at,
    team_member_id: user.team_member_table[0]?.team_member_id,
    team_member_team: user.team_member_table[0]?.team_member_team_id,
    team_member_role: user.team_member_table[0]?.team_member_role,
    order_count: user._count.order_table,
    // order_purchased_amount: user.order_table[0]._sum.order_total,
  }));

  const count = await prisma.user_table.count({
    where: filter,
  });

  return {
    data: formattedUsers,
    count: count,
  };
};
