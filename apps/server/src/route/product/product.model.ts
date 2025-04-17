import { Prisma } from "@prisma/client";
import type { typeProductCreateSchema } from "../../schema/schema.js";
import { slugifyVariant } from "../../utils/function.js";
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
  imageUrl: string;
}) => {
  const { productCategoryName, productCategoryDescription, teamId, imageUrl } =
    params;

  const productCategory = await prisma.product_category_table.create({
    data: {
      product_category_name: productCategoryName,
      product_category_description: productCategoryDescription,
      product_category_team_id: teamId,
      product_category_image: imageUrl,
      product_category_slug: slugifyVariant(productCategoryName),
    },
    select: {
      product_category_id: true,
      product_category_name: true,
      product_category_description: true,
      product_category_team_id: true,
      product_category_created_at: true,
      product_category_updated_at: true,
      product_category_slug: true,
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

      // Create product variants
      await tx.product_variant_table.createMany({
        data: product_variants.map((variant) => ({
          product_variant_id: variant.product_variant_id,
          product_variant_product_id: product_id,
          product_variant_color: variant.product_variant_color,
          product_variant_slug: variant.product_variant_slug,
        })),
      });

      for (const variant of product_variants) {
        if (variant.variant_sizes.length > 0) {
          await tx.variant_size_table.createMany({
            data: variant.variant_sizes.map((size) => ({
              variant_size_id: size.variant_size_id,
              variant_size_variant_id: variant.product_variant_id,
              variant_size_value: size.variant_size_value,
              variant_size_quantity: size.variant_size_quantity,
            })),
          });
        }
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

export const productVariantUpdateModel = async (
  params: typeProductCreateSchema
) => {
  await prisma.$transaction(async (tx) => {
    for (const product of params) {
      const {
        product_id,
        product_name,
        product_description,
        product_price,
        product_sale_percentage,
        product_slug,
        product_category_id,
        product_team_id,
        product_variants,
      } = product;

      // 1. Update product_table
      await tx.product_table.update({
        where: { product_id },
        data: {
          product_name,
          product_description,
          product_price,
          product_sale_percentage,
          product_slug,
          product_category_id,
          product_team_id,
        },
      });

      for (const variant of product_variants) {
        const {
          product_variant_id,
          product_variant_color,
          product_variant_slug,
          variant_sizes,
          variant_sample_images,
        } = variant;
        console.log(product_variant_id, "variant");

        if (variant.product_variant_is_deleted) {
          await tx.product_variant_table.update({
            where: { product_variant_id: product_variant_id },
            data: {
              product_variant_is_deleted: true,
            },
          });

          continue;
        }

        await tx.product_variant_table.update({
          where: { product_variant_id },
          data: {
            product_variant_color,
            product_variant_slug,
          },
        });

        await tx.variant_size_table.deleteMany({
          where: {
            variant_size_variant_id: product_variant_id,
          },
        });

        await tx.variant_sample_image_table.deleteMany({
          where: {
            variant_sample_image_product_variant_id: product_variant_id,
          },
        });

        if (variant_sizes.length > 0) {
          await tx.variant_size_table.createMany({
            data: variant_sizes.map((size) => ({
              variant_size_id: size.variant_size_id,
              variant_size_variant_id: product_variant_id,
              variant_size_value: size.variant_size_value,
              variant_size_quantity: size.variant_size_quantity,
            })),
          });
        }

        if (variant_sample_images.length > 0) {
          await tx.variant_sample_image_table.createMany({
            data: variant_sample_images.map((image) => ({
              variant_sample_image_image_url:
                image.variant_sample_image_image_url,
              variant_sample_image_product_variant_id: product_variant_id,
            })),
          });
        }
      }
    }
  });

  return { message: "Product and variants updated successfully" };
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
          product_variant_slug: true,
          variant_sizes: {
            select: {
              variant_size_id: true,
              variant_size_value: true,
              variant_size_quantity: true,
            },
          },
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

  const filter: Prisma.product_variant_tableWhereInput = {};
  const offset = (skip - 1) * take;

  if (search) {
    filter.product_variant_product = {
      product_name: {
        contains: search,
        mode: "insensitive",
      },
    };
  }

  if (teamId) {
    filter.product_variant_product = {
      product_team_id: teamId,
    };

    filter.product_variant_is_deleted = {
      equals: false,
    };
  }

  if (category) {
    filter.product_variant_product = {
      product_category_id: category,
    };
  }

  const products = await prisma.product_variant_table.findMany({
    where: filter,
    select: {
      product_variant_id: true,
      product_variant_color: true,
      product_variant_slug: true,
      product_variant_product: {
        select: {
          product_id: true,
          product_name: true,
          product_price: true,
          product_sale_percentage: true,
          product_created_at: true,
        },
      },
      variant_sizes: {
        select: {
          variant_size_id: true,
          variant_size_value: true,
          variant_size_quantity: true,
        },
      },
      variant_sample_images: {
        select: {
          variant_sample_image_image_url: true,
        },
        take: 1,
      },
    },
    orderBy: {
      product_variant_product: {
        product_created_at: "desc",
      },
    },
    take,
    skip: offset,
  });

  const count = await prisma.product_variant_table.count({
    where: filter,
  });

  return {
    data: products,
    count,
  };
};
