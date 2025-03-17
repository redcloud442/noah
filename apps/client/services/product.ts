import axios from "axios";

export const productService = {
  getCollections: async (params: {
    take: number;
    skip: number;
    search?: string;
  }) => {
    const { data } = await axios.get("/api/v1/product/collections", { params });

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  },
};
