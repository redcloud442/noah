import { type typeResellerOrdersSchema } from "@/utils/schema";
import axios from "axios";

export const orderService = {
  getOrders: async (params: typeResellerOrdersSchema) => {
    const data = await axios.post("/api/v1/reseller/orders", params);

    if (data.status !== 200) {
      throw new Error(data.data.message);
    }

    return data.data;
  },
};
