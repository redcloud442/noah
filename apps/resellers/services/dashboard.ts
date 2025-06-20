import axios from "axios";

export const dashboardService = {
  getDashboardDataTransactions: async (params: {
    take: number;
    skip: number;
  }) => {
    const response = await axios.get(
      "/api/v1/reseller/dashboard/transactions",
      {
        params,
      }
    );

    if (response.status !== 200) {
      throw new Error("Failed to fetch dashboard data");
    }

    return response.data;
  },
  getDashboardData: async () => {
    const response = await axios.get("/api/v1/reseller/dashboard");

    if (response.status !== 200) {
      throw new Error("Failed to fetch dashboard data");
    }

    return response.data;
  },
};
