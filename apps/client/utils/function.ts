import { PrismaClient } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import {
  ProductFormType,
  ProductVariantFormType,
  typeProductCreateSchema,
} from "./schema";

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
  prisma: PrismaClient,
  teamName: string
) => {
  const findId = await prisma.product_category_table.findFirst({
    select: {
      product_category_id: true,
    },
    where: {
      product_category_slug: {
        contains: slug,
        mode: "insensitive",
      },
    },
  });

  if (!findId) {
    redirect(`/${teamName}/admin/product/collections`);
  }

  const products = await prisma.product_table.findMany({
    where: {
      product_category_id: findId.product_category_id,
      product_variants: {
        some: {
          product_variant_is_deleted: false,
        },
      },
    },
    include: {
      product_variants: {
        select: {
          product_variant_id: true,
          product_variant_product_id: true,
          product_variant_slug: true,
          product_variant_color: true,
          product_variant_product: true,
          product_variant_is_deleted: true,
          product_variant_is_featured: true,
          variant_sizes: {
            select: {
              variant_size_id: true,
              variant_size_value: true,
              variant_size_quantity: true,
              variant_size_variant_id: true,
            },
          },
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
          product_variant_is_deleted: false,
        },
      },
    },
    include: {
      product_variants: {
        where: {
          product_variant_is_deleted: false,
        },
        select: {
          product_variant_id: true,
          product_variant_product_id: true,
          product_variant_slug: true,
          product_variant_color: true,

          product_variant_product: true,
          product_variant_is_deleted: true,
          product_variant_is_featured: true,
          variant_sizes: {
            select: {
              variant_size_id: true,
              variant_size_value: true,
              variant_size_quantity: true,
              variant_size_variant_id: true,
            },
          },
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

  const variantInfo = await prisma.product_variant_table.findFirst({
    where: {
      product_variant_slug: {
        contains: slug,
        mode: "insensitive",
      },
      product_variant_is_deleted: false,
    },
    include: {
      variant_sizes: true,
      variant_sample_images: true,
    },
  });

  return { product, variantInfo };
};

export const findProductBySlugAdmin = async (
  slug: string,
  prisma: PrismaClient
) => {
  const product = await prisma.product_table.findFirst({
    where: {
      product_slug: {
        contains: slug,
        mode: "insensitive",
      },
      product_variants: {
        some: {
          product_variant_is_deleted: false,
        },
      },
    },
    include: {
      product_variants: {
        select: {
          product_variant_id: true,
          product_variant_product_id: true,
          product_variant_slug: true,
          product_variant_color: true,
          product_variant_product: {
            select: {
              product_slug: true,
            },
          },
          product_variant_is_featured: true,
          variant_sizes: {
            select: {
              variant_size_id: true,
              variant_size_value: true,
              variant_size_quantity: true,
              variant_size_variant_id: true,
            },
          },
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

  return { product };
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
  const formattedProducts = await Promise.all(
    product.products.map(async (prod) => {
      const productId = uuidv4(); // Move productId inside if per product unique

      // Upload Size Guide
      let sizeGuideUrl: string | undefined;
      if (prod.sizeGuide) {
        const cleanFileName = prod.sizeGuide.name.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        );
        const filePath = `uploads/${Date.now()}_${cleanFileName}`;

        const { error: uploadError } = await supabaseClient.storage
          .from("PRODUCT_IMAGE")
          .upload(filePath, prod.sizeGuide, { upsert: true });

        if (uploadError) throw new Error(uploadError.message);

        sizeGuideUrl = `https://umypvsozlsjtjfsakqxg.supabase.co/storage/v1/object/public/PRODUCT_IMAGE/${filePath}`;
      }

      // Upload Variant Images
      const product_variants = await Promise.all(
        prod.variants.map(async (variant) => {
          const variantId = variant.id || uuidv4();
          const imageUrls: string[] = [];

          if (variant.images && variant.images.length > 0) {
            for (const image of variant.images ?? []) {
              if (!image) continue;

              const cleanFileName =
                image instanceof File
                  ? image.name.replace(/[^a-zA-Z0-9.-]/g, "_")
                  : "unnamed_file";
              const filePath = `uploads/${Date.now()}_${cleanFileName}`;

              const { error: uploadError } = await supabaseClient.storage
                .from("PRODUCT_IMAGE")
                .upload(filePath, image, { upsert: true });

              if (uploadError) throw new Error(uploadError.message);

              const publicUrl = `https://umypvsozlsjtjfsakqxg.supabase.co/storage/v1/object/public/PRODUCT_IMAGE/${filePath}`;
              imageUrls.push(publicUrl);
            }
          } else if (variant.publicUrl && variant.publicUrl.length > 0) {
            imageUrls.push(...variant.publicUrl); // fallback use publicUrl
          }

          return {
            product_variant_id: variantId,
            product_variant_product_id: productId,
            product_variant_color: variant.color,
            product_variant_slug: slugifyVariant(
              slugify(prod.name),
              slugify(variant.color)
            ),
            variant_sample_images: imageUrls.map((url) => ({
              variant_sample_image_image_url: url,
              variant_sample_image_product_variant_id: variantId,
            })),
            variant_sizes: variant.sizesWithQuantities.map((sizeObj) => ({
              variant_size_id: uuidv4(),
              variant_size_variant_id: variantId,
              variant_size_value: sizeObj.size,
              variant_size_quantity: sizeObj.quantity,
            })),
          };
        })
      );

      return {
        product_id: productId,
        product_name: prod.name,
        product_slug: slugify(prod.name),
        product_description: prod.description,
        product_size_guide_url: sizeGuideUrl ?? prod.sizeGuideUrl ?? null,
        product_price: prod.price,
        product_sale_percentage: 0,
        product_category_id: prod.category,
        product_team_id: teamId,
        product_variants,
      };
    })
  );

  return {
    formattedProducts:
      formattedProducts as unknown as typeProductCreateSchema[], // cast only once, because we know it's correct
  };
};

export const formattedUpdateProductResponse = async (
  product: ProductFormType,
  supabaseClient: SupabaseClient,
  teamId: string,
  productId: string
) => {
  const formattedProducts = await Promise.all(
    product.products.map(async (prod) => {
      let sizeGuideUrl: string | undefined;

      // Upload size guide if new file exists
      if (prod.sizeGuide instanceof File && prod.sizeGuide.size > 0) {
        const rawFileName = prod.sizeGuide.name;
        const cleanFileName = rawFileName.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = `uploads/${Date.now()}_${cleanFileName}`;

        const { error } = await supabaseClient.storage
          .from("PRODUCT_IMAGE")
          .upload(filePath, prod.sizeGuide, { upsert: true });

        if (error) throw new Error(error.message);

        sizeGuideUrl = `https://umypvsozlsjtjfsakqxg.supabase.co/storage/v1/object/public/PRODUCT_IMAGE/${filePath}`;
      }

      const product_variants = await Promise.all(
        prod.variants.map(async (variant) => {
          const variantId = variant.id || uuidv4(); // Always fallback
          const imageUrls: string[] = [];

          // Upload new variant images
          if (variant.images && variant.images.length > 0) {
            for (const image of variant.images) {
              if (!image) continue;

              const rawFileName =
                image instanceof File ? image.name : "unnamed_file";
              const cleanFileName = rawFileName.replace(/[^a-zA-Z0-9.-]/g, "_");
              const filePath = `uploads/${Date.now()}_${cleanFileName}`;

              const { error: uploadError } = await supabaseClient.storage
                .from("PRODUCT_IMAGE")
                .upload(filePath, image, { upsert: true });

              if (uploadError) throw new Error(uploadError.message);

              const publicUrl = `https://umypvsozlsjtjfsakqxg.supabase.co/storage/v1/object/public/PRODUCT_IMAGE/${filePath}`;
              imageUrls.push(publicUrl);
            }
          } else if (variant.publicUrl && variant.publicUrl.length > 0) {
            // Use existing publicUrl if available
            imageUrls.push(...variant.publicUrl);
          }

          return {
            product_variant_id: variantId,
            product_variant_product_id: productId,
            product_variant_color: variant.color,
            product_variant_is_deleted: variant.isDeleted || false,
            product_variant_slug: slugifyVariant(
              slugify(prod.name),
              slugify(variant.color)
            ),
            product_variant_size_guide_url: prod.sizeGuideUrl || sizeGuideUrl,
            variant_sample_images: imageUrls.map((url) => ({
              variant_sample_image_image_url: url,
              variant_sample_image_product_variant_id: variantId, // <-- Always use variantId here
            })),
            variant_sizes: variant.sizesWithQuantities.map((sizeObj) => ({
              variant_size_id: uuidv4(),
              variant_size_variant_id: variantId,
              variant_size_value: sizeObj.size,
              variant_size_quantity: sizeObj.quantity,
            })),
          };
        })
      );

      return {
        product_id: productId,
        product_name: prod.name,
        product_slug: slugify(prod.name),
        product_description: prod.description || "",
        product_price: prod.price,
        product_sale_percentage: 0,
        product_category_id: prod.category,
        product_team_id: teamId,
        product_size_guide_url: prod.sizeGuideUrl || sizeGuideUrl,
        product_variants:
          product_variants as unknown as ProductVariantFormType[],
      };
    })
  );

  return formattedProducts;
};

export const formatDateToYYYYMMDD = (date: Date | string): string => {
  const inputDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(inputDate.getTime())) {
    return "Invalid date"; // Handle invalid dates gracefully
  }

  // Extract LOCAL time-based date components (adjusted for PH Time)
  const year = String(inputDate.getFullYear()); // Use `getFullYear()` instead of `getUTCFullYear()`
  const month = String(inputDate.getMonth() + 1).padStart(2, "0"); // Use `getMonth()`
  const day = String(inputDate.getDate()).padStart(2, "0"); // Use `getDate()`

  return `${year}-${month}-${day}`;
};

export const pesoSignedNumber = (number: number): string => {
  return `₱ ${number.toLocaleString()}`;
};

export const formateMonthDateYear = (date: Date | string): string => {
  const inputDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(inputDate.getTime())) {
    return "Invalid date"; // Handle invalid dates gracefully
  }

  const year = String(inputDate.getFullYear()); // Full year
  const month = String(inputDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(inputDate.getDate()).padStart(2, "0");

  return `${month}/${day}/${year}`;
};

export const formatTime = (date: Date | string): string => {
  const inputDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(inputDate.getTime())) {
    return "Invalid date"; // Handle invalid dates gracefully
  }

  let hours = inputDate.getHours(); // Get hours (0-23)
  const minutes = String(inputDate.getMinutes()).padStart(2, "0"); // Get minutes with leading zero
  const ampm = hours >= 12 ? "PM" : "AM"; // Determine AM or PM

  hours = hours % 12 || 12; // Convert 24-hour format to 12-hour format (0 becomes 12)

  return `${hours}:${minutes} ${ampm}`;
};

export const formatDay = (date: Date | string): string => {
  const inputDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(inputDate.getTime())) {
    return "Invalid date"; // Handle invalid dates gracefully
  }

  // Force UTC-based day extraction
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = daysOfWeek[inputDate.getUTCDay()]; // Use `getUTCDay()` instead of `getDay()`

  return dayName;
};
