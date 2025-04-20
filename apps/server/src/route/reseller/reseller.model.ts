import prisma from "../../utils/prisma.js";

export const resellerGetListModel = async (params: {
  take: number;
  skip: number;
  teamMemberId: string;
}) => {
  const { take, skip, teamMemberId } = params;

  const offset = take * (skip - 1);

  const resellers = await prisma.reseller_transaction_table.findMany({
    where: {
      reseller_transaction_reseller: {
        reseller_team_member_id: teamMemberId,
      },
    },
    take,
    skip: offset,
    orderBy: {
      reseller_transaction_created_at: "desc",
    },
  });

  const total = await prisma.reseller_transaction_table.count();

  return {
    data: resellers,
    total,
  };
};

export const resellerDashboardModel = async (params: {
  resellerId: string;
}) => {
  const { resellerId } = params;
  const totalResellerSales = await prisma.order_table.count({
    where: {
      order_reseller_id: resellerId,
      order_status: "PAID",
    },
  });

  const todayResellerSales = await prisma.order_table.count({
    where: {
      order_reseller_id: resellerId,
      order_status: "PAID",
      order_created_at: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    },
  });

  return {
    totalResellerSales,
    todayResellerSales,
  };
};
