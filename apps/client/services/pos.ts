import axios from "axios";

export const posService = {
  getProducts: async (params: { take: number; skip: number }) => {
    const response = await axios.get(
      `/api/v1/pos/get-pos-products?take=${params.take}&skip=${params.skip}`
    );

    if (response.status !== 200) {
      throw new Error("Failed to fetch products");
    }

    return response.data;
  },
  checkout: async (params: {
    total_amount: number;
    cartItems?: {
      product_variant_id: string;
      product_quantity: number;
      product_variant_size: string;
      product_variant_product: string;
    }[];
  }) => {
    const response = await axios.post("/api/v1/pos/checkout", params);

    if (response.status !== 200) {
      throw new Error("Failed to checkout");
    }

    return response.data;
  },
};
