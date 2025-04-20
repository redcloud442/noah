import { Product } from "@/utils/types";
import { apiClient } from "./axios";

export const cartService = {
  create: async (params: {
    product_variant_id: string;
    product_quantity: number;
    product_variant_size: string;
    product_variant_color: string;
    product_variant_quantity: number;
    product_variant_image: string;
    product_id: string;
    product_name: string;
    product_price: number;
  }) => {
    const result = await apiClient.post("/cart", params);

    if (result.status !== 200) {
      throw new Error("Login failed");
    }

    return result.data as Product;
  },

  get: async () => {
    const result = await apiClient.get("/cart");

    if (result.status !== 200) {
      throw new Error("Login failed");
    }

    return result.data;
  },

  delete: async (id: string) => {
    const result = await apiClient.delete(`/cart/${id}`);

    return result.data;
  },

  update: async (id: string, product_quantity: number) => {
    const result = await apiClient.put(`/cart/${id}`, { product_quantity });

    if (result.status !== 200) {
      throw new Error("Update failed");
    }

    return result.data;
  },
};
