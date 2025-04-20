import { apiClient } from "@/utils/axios/axios";

export const dashboardService = {
  getDashboardDataTransactions: async (params: {
    take: number;
    skip: number;
  }) => {
    const response = await apiClient.get("/reseller/dashboard/transactions", {
      params,
    });

    if (response.status !== 200) {
      throw new Error("Failed to fetch dashboard data");
    }

    return response.data;
  },
  getDashboardData: async () => {
    const response = await apiClient.get("/reseller/dashboard");

    if (response.status !== 200) {
      throw new Error("Failed to fetch dashboard data");
    }

    return response.data;
  },
};
