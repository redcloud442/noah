import { Product } from "@/utils/types";
import axios from "axios";

export const cartService = {
  create: async (params: {
    cart_id: string;
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
    const result = await axios.post("/api/v1/cart", params);

    if (result.status !== 200) {
      throw new Error("Login failed");
    }

    return result.data as Product;
  },

  get: async () => {
    const result = await axios.get("/api/v1/cart");

    if (result.status !== 200) {
      throw new Error("Error fetching cart");
    }

    return result.data;
  },

  checkedOut: async () => {
    const result = await axios.get("/api/v1/cart/checked-out");

    if (result.status !== 200) {
      throw new Error("Error fetching cart");
    }

    return result.data;
  },

  getQuantity: async (params: {
    items: {
      product_variant_id: string;
      product_variant_size: string;
    }[];
  }) => {
    const result = await axios.post("/api/v1/cart/quantity", params);

    if (result.status !== 200) {
      throw new Error("Error fetching cart quantity");
    }

    return result.data;
  },
  delete: async (id: string) => {
    const result = await axios.delete(`/api/v1/cart/${id}`);

    return result.data;
  },

  update: async (id: string, product_quantity: number) => {
    const result = await axios.put(`/api/v1/cart/${id}`, { product_quantity });

    if (result.status !== 200) {
      throw new Error("Update failed");
    }

    return result.data;
  },
  checkout: async (params: {
    items: string[];
    cartItems?: {
      cart_id: string;
      product_variant_id: string;
      product_quantity: number;
      product_variant_size: string;
      product_variant_color: string;
      product_variant_quantity: number;
      product_variant_image: string;
      product_id: string;
      product_name: string;
      product_price: number;
      cart_is_checked_out: boolean;
    }[];
  }) => {
    const result = await axios.post("/api/v1/cart/checkout", params);

    if (result.status !== 200) {
      throw new Error("Error checking out items");
    }

    return result.data;
  },
};
