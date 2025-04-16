import {
  ProductFormType,
  typeProductCreateSchema,
} from "@packages/shared/src/schema/schema";
import { PrismaClient } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

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

export const slugifyVariant = (name: string, text: string) => {
  return `${name}-${text}`
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
    take: 15,
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

export const formatDateToLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formattedCreateProductResponse = async (
  product: ProductFormType,
  supabaseClient: SupabaseClient,
  teamId: string
) => {
  const productId = uuidv4();

  const formattedProducts = await Promise.all(
    product.products.map(async (prod) => {
      const variants = await Promise.all(
        prod.variants.map(async (variant) => {
          const variantId = uuidv4();
          const imageUrls: string[] = [];

          for (const image of variant.images) {
            const filePath = `uploads/${Date.now()}_${image.name}`;

            const { error: uploadError } = await supabaseClient.storage
              .from("PRODUCT_IMAGE")
              .upload(filePath, image, { upsert: true });

            if (uploadError) throw new Error(uploadError.message);

            const publicUrl = `https://umypvsozlsjtjfsakqxg.supabase.co/storage/v1/object/public/PRODUCT_IMAGE/${filePath}`;

            imageUrls.push(publicUrl);
          }

          return {
            product_variant_id: variantId,
            product_variant_product_id: productId,
            product_variant_color: variant.color,
            product_variant_size: variant.size,
            product_variant_quantity: variant.quantity,
            product_variant_slug: slugifyVariant(
              slugify(prod.name),
              slugify(variant.color)
            ),
            variant_sample_images: imageUrls.map((url) => ({
              variant_sample_image_image_url: url,
              variant_sample_image_product_variant_id: variantId,
            })),
          };
        })
      );

      return {
        product_id: productId,
        product_name: prod.name,
        product_slug: slugify(prod.name),
        product_description: prod.description,
        product_price: prod.price,
        product_sale_percentage: 0,
        product_category_id: prod.category,
        product_team_id: teamId,
        product_variants: variants,
      };
    })
  );

  return {
    formattedProducts:
      formattedProducts as unknown as typeProductCreateSchema[],
  };
};
