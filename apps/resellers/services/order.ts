import { apiClient } from "@/utils/axios/axios";
import { type typeResellerOrdersSchema } from "@/utils/schema";

export const orderService = {
  getOrders: async (params: typeResellerOrdersSchema) => {
    const data = await apiClient.post("/reseller/orders", params);

    if (data.status !== 200) {
      throw new Error(data.data.message);
    }

    return data.data;
  },
};
