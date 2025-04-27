import type { Prisma } from "@prisma/client";
import prisma from "../../utils/prisma.js";
import type { ProductPublicParams } from "../../utils/schema.js";

export const productPublicModel = async (params: ProductPublicParams) => {
  const { search, category, sort, take, skip } = params;

  const filter: Prisma.product_variant_tableWhereInput = {};
  const sortFilter: Prisma.product_variant_tableOrderByWithRelationInput = {};
  const offset = (skip - 1) * take;

  if (search) {
    filter.product_variant_product = {
      product_name: { contains: search, mode: "insensitive" },
    };
  }

  if (category) {
    filter.product_variant_product = {
      product_category_id: category,
    };
  }

  if (sort) {
    if (sort === "newest") {
      sortFilter.product_variant_product = {
        product_created_at: "desc",
      };
    }

    if (sort === "oldest") {
      sortFilter.product_variant_product = {
        product_created_at: "asc",
      };
    }

    if (sort === "price_asc") {
      sortFilter.product_variant_product = {
        product_price: "asc",
      };
    }

    if (sort === "price_desc") {
      sortFilter.product_variant_product = {
        product_price: "desc",
      };
    }
    if (sort === "featured") {
      sortFilter.product_variant_is_featured = "desc";
    }

    if (sort === "best_seller") {
      sortFilter.product_variant_product = {
        product_is_best_seller: "desc",
      };
    }
  }
  const products = await prisma.product_variant_table.findMany({
    where: {
      product_variant_is_deleted: false,
      ...filter,
    },
    include: {
      product_variant_product: true,
      variant_sample_images: true,
      variant_sizes: true,
    },
    orderBy: sortFilter,
    take,
    skip: offset,
  });

  const count = await prisma.product_variant_table.count({
    where: {
      ...filter,
    },
  });

  return {
    data: products,
    count,
    hasMore: count > offset + products.length,
  };
};
