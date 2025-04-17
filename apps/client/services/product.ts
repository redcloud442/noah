import { ProductCategoryForm, typeProductCreateSchema } from "@/utils/schema";
import { product_category_table } from "@prisma/client";
import axios from "axios";

export const productService = {
  getCollections: async (params: {
    take: number;
    skip: number;
    search?: string;
    teamId?: string;
  }) => {
    const { data } = await axios.get("/api/v1/product/collections", { params });

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  },
  createProductCategory: async (
    params: ProductCategoryForm & { imageUrl: string }
  ) => {
    const { data } = await axios.post("/api/v1/product/collections", params);

    if (data.error) {
      throw new Error(data.error);
    }

    return data as product_category_table;
  },

  createProduct: async (params: typeProductCreateSchema[]) => {
    const { data } = await axios.post("/api/v1/product", params);

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  },

  updateProduct: async (params: typeProductCreateSchema[]) => {
    const { data } = await axios.put("/api/v1/product", params);

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  },

  getProductCollection: async (params: {
    take: number;
    skip: number;
    search?: string;
    teamId?: string;
    collectionSlug: string;
  }) => {
    const { data } = await axios.post(
      `/api/v1/product/collections/${params.collectionSlug}`,
      { params }
    );

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  },
  getProducts: async (params: {
    take: number;
    skip: number;
    search?: string;
    teamId?: string;
    category?: string;
  }) => {
    const { data } = await axios.post("/api/v1/product/all-product", {
      params,
    });

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  },
};
