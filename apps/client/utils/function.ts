import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(date));

export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
};

export const findCollectionBySlug = async (
  slug: string,
  prisma: PrismaClient
) => {
  const findId = await prisma.product_category_table.findFirst({
    select: {
      product_category_id: true,
    },
    where: {
      product_category_name: {
        contains: slug,
        mode: "insensitive",
      },
    },
  });

  if (!findId) {
    redirect("/admin/product/collections");
  }

  const products = await prisma.product_table.findMany({
    where: {
      product_category_id: findId.product_category_id,
    },
    include: {
      product_variants: {
        select: {
          product_variant_id: true,
          product_variant_size: true,
          product_variant_quantity: true,
          product_variant_product_id: true,
          product_variant_slug: true,
          product_variant_color: true,
          product_variant_product: true,
          variant_sample_images: {
            select: {
              variant_sample_image_id: true,
              variant_sample_image_image_url: true,
              variant_sample_image_product_variant_id: true,
              variant_sample_image_created_at: true,
            },
          },
        },
      },
    },
  });

  return products;
};

export const findProductBySlug = async (slug: string, prisma: PrismaClient) => {
  const product = await prisma.product_table.findFirst({
    where: {
      product_variants: {
        some: {
          product_variant_slug: {
            contains: slug,
            mode: "insensitive",
          },
        },
      },
    },
    include: {
      product_variants: {
        select: {
          product_variant_id: true,
          product_variant_size: true,
          product_variant_quantity: true,
          product_variant_product_id: true,
          product_variant_slug: true,
          product_variant_color: true,
          product_variant_product: true,
          variant_sample_images: {
            select: {
              variant_sample_image_id: true,
              variant_sample_image_image_url: true,
              variant_sample_image_product_variant_id: true,
              variant_sample_image_created_at: true,
            },
          },
        },
      },
    },
  });

  return product;
};
