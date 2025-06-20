import { typeDashboardSchema } from "@/utils/schema";
import { DashboardType } from "@/utils/types";
import axios from "axios";

export const dashboardService = {
  get: async (params: typeDashboardSchema) => {
    const result = await axios.post("/api/v1/dashboard", params);

    if (result.status !== 200) {
      throw new Error("Dashboard failed");
    }

    return result.data as DashboardType;
  },
};
