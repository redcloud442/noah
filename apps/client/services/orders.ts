import { order_table } from "@prisma/client";
import axios from "axios";
import { OrderItem, OrderType } from "../utils/types";

export const ordersService = {
  getOrders: async (params: { take: number; skip: number }) => {
    const result = await axios.get("/api/v1/orders", { params });

    if (result.status !== 200) {
      throw new Error("Payment failed");
    }

    return result.data as {
      orders: order_table[];
      count: number;
    };
  },
  getOrdersAdmin: async (params: {
    take: number;
    skip: number;
    userId: string;
  }) => {
    const result = await axios.post("/api/v1/orders/list", { params });

    if (result.status !== 200) {
      throw new Error("Payment failed");
    }

    return result.data as {
      orders: order_table[];
      count: number;
    };
  },
  getOrderItems: async (order_number: string) => {
    const result = await axios.get(`/api/v1/orders/${order_number}/items`);

    if (result.status !== 200) {
      throw new Error("Payment failed");
    }

    return result.data as OrderItem[];
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
    const result = await axios.post("/api/v1/orders/list", { params });

    if (result.status !== 200) {
      throw new Error("Payment failed");
    }

    return result.data as {
      orders: OrderType[];
      count: number;
    };
  },
  updateOrderStatus: async (params: { orderId: string; status: string }) => {
    const result = await axios.put(`/api/v1/orders/${params.orderId}`, {
      status: params.status,
    });

    if (result.status !== 200) {
      throw new Error("Payment failed");
    }

    return result.data;
  },

  trackOrder: async (params: { orderNumber: string; orderId: string }) => {
    const result = await axios.post("/api/v1/orders/tracking", {
      order_number: params.orderNumber,
      order_id: params.orderId,
    });

    if (result.status !== 200) {
      throw new Error("Payment failed");
    }

    return result.data as {
      redirectUrl: string;
    };
  },
};
