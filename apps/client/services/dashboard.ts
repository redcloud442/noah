import { typeDashboardSchema } from "@/utils/schema";
import { DashboardType } from "@/utils/types";
import { apiClient } from "./axios";

export const dashboardService = {
  get: async (params: typeDashboardSchema) => {
    const result = await apiClient.post("/dashboard", params);

    if (result.status !== 200) {
      throw new Error("Dashboard failed");
    }

    return result.data as DashboardType;
  },
};
