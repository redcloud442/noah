import { Prisma } from "@prisma/client";
import type { typeProductCreateSchema } from "../../schema/schema.js";
import prisma from "../../utils/prisma.js";

export const productCollectionModel = async (params: {
  search?: string;
  take: number;
  skip: number;
  teamId?: string;
}) => {
  const { search, take, skip, teamId } = params;

  const filter: Prisma.product_category_tableWhereInput = {};
  const offset = (skip - 1) * take;

  if (search) {
    filter.product_category_name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (teamId) {
    filter.product_category_team_id = teamId;
  }

  const collections = await prisma.product_category_table.findMany({
    where: filter,
    orderBy: {
      product_category_created_at: "desc",
    },
    take,
    skip: offset,
  });

  const count = await prisma.product_category_table.count({
    where: {
      product_category_name: {
        contains: search,
        mode: "insensitive",
      },
      product_category_team_id: teamId,
    },
  });

  return {
    collections,
    count,
  };
};

export const productCreateModel = async (params: {
  productCategoryName: string;
  productCategoryDescription: string;
  teamId: string;
}) => {
  const { productCategoryName, productCategoryDescription, teamId } = params;

  const productCategory = await prisma.product_category_table.create({
    data: {
      product_category_name: productCategoryName,
      product_category_description: productCategoryDescription,
      product_category_team_id: teamId,
    },
    select: {
      product_category_id: true,
      product_category_name: true,
      product_category_description: true,
      product_category_team_id: true,
      product_category_created_at: true,
      product_category_updated_at: true,
    },
  });

  return productCategory;
};

export const productVariantCreateModel = async (
  params: typeProductCreateSchema
) => {
  await prisma.$transaction(async (tx) => {
    for (const product of params) {
      const {
        product_category_id,
        product_description,
        product_id,
        product_name,
        product_price,
        product_sale_percentage,
        product_slug,
        product_team_id,
        product_variants,
      } = product;

      // Create product
      await tx.product_table.create({
        data: {
          product_id: product_id.toString(),
          product_category_id,
          product_description,
          product_name,
          product_price,
          product_sale_percentage,
          product_slug,
          product_team_id,
        },
      });

      // Create variants only (flat data, no nested images)
      await tx.product_variant_table.createMany({
        data: product_variants.map((variant) => ({
          product_variant_id: variant.product_variant_id,
          product_variant_product_id: product_id,
          product_variant_color: variant.product_variant_color,
          product_variant_size: variant.product_variant_size,
          product_variant_quantity: variant.product_variant_quantity,
          product_variant_slug: variant.product_variant_slug,
        })),
      });

      // Create images for each variant separately
      for (const variant of product_variants) {
        if (variant.variant_sample_images.length > 0) {
          await tx.variant_sample_image_table.createMany({
            data: variant.variant_sample_images.map((image) => ({
              variant_sample_image_image_url:
                image.variant_sample_image_image_url,
              variant_sample_image_product_variant_id:
                variant.product_variant_id,
            })),
          });
        }
      }
    }
  });

  return { message: "Product variant created successfully" };
};

export const productCollectionSlugModel = async (params: {
  collectionSlug: string;
  take: number;
  skip: number;
  search?: string;
  teamId?: string;
}) => {
  const { collectionSlug, take, skip, search, teamId } = params;

  const filter: Prisma.product_tableWhereInput = {};
  const offset = (skip - 2) * take;

  const productCategory = await prisma.product_category_table.findFirst({
    where: {
      product_category_name: collectionSlug,
    },
  });

  if (!productCategory) {
    throw new Error("Product category not found");
  }

  if (search) {
    filter.product_name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (teamId) {
    filter.product_team_id = teamId;
  }

  if (collectionSlug) {
    filter.product_category_id = productCategory.product_category_id;
  }

  const products = await prisma.product_table.findMany({
    where: filter,
    select: {
      product_id: true,
      product_name: true,
      product_price: true,
      product_sale_percentage: true,
      product_created_at: true,
      product_description: true,
      product_slug: true,
      product_variants: {
        select: {
          product_variant_id: true,
          product_variant_color: true,
          product_variant_size: true,
          product_variant_quantity: true,
          product_variant_slug: true,
          variant_sample_images: {
            select: {
              variant_sample_image_image_url: true,
            },
          },
        },
      },
    },
    orderBy: {
      product_created_at: "desc",
    },
    take,
    skip: offset,
  });

  const count = await prisma.product_table.count({
    where: filter,
  });

  return {
    data: products,
    count,
    hasMore: count > offset + products.length,
  };
};

export const productGetAllProductModel = async (params: {
  take: number;
  skip: number;
  search?: string;
  teamId?: string;
  category?: string;
}) => {
  const { take, skip, search, teamId, category } = params;

  const filter: Prisma.product_tableWhereInput = {};
  const offset = (skip - 1) * take;

  if (search) {
    filter.product_name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (teamId) {
    filter.product_team_id = teamId;
  }

  if (category) {
    filter.product_category_id = category;
  }

  const products = await prisma.product_table.findMany({
    where: filter,
    select: {
      product_id: true,
      product_name: true,
      product_price: true,
      product_sale_percentage: true,
      product_created_at: true,
      product_description: true,
      product_slug: true,
      product_variants: {
        select: {
          product_variant_id: true,
          product_variant_color: true,
          product_variant_size: true,
          product_variant_quantity: true,
          product_variant_slug: true,
          variant_sample_images: {
            select: {
              variant_sample_image_image_url: true,
            },
          },
        },
      },
    },
    orderBy: {
      product_created_at: "desc",
    },
    take,
    skip: offset,
  });

  const count = await prisma.product_table.count({
    where: filter,
  });

  return {
    data: products,
    count,
  };
};
