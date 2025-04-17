import { order_table } from "@prisma/client";
import { Order, OrderType } from "../utils/types";
import { apiClient } from "./axios";

export const ordersService = {
  getOrders: async (params: { take: number; skip: number }) => {
    const result = await apiClient.get("/orders", { params });

    if (result.status !== 200) {
      throw new Error("Payment failed");
    }

    return result.data as {
      orders: order_table[];
      count: number;
    };
  },
  getOrderItems: async (order_number: string) => {
    const result = await apiClient.get(`/orders/${order_number}/items`);

    if (result.status !== 200) {
      throw new Error("Payment failed");
    }

    return result.data as Order["order_items"];
  },
  getAllOrders: async (params: {
    take: number;
    skip: number;
    search: string;
    dateFilter: {
      start: string;
      end: string;
    };
    teamId: string;
  }) => {
    const result = await apiClient.post("/orders/list", { params });

    if (result.status !== 200) {
      throw new Error("Payment failed");
    }

    return result.data as {
      orders: OrderType[];
      count: number;
    };
  },
};
