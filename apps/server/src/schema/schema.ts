import { z } from "zod";

export const productSchema = z.object({
  cart_id: z.string().uuid(),
  product_id: z.string().uuid(),
  product_name: z.string(),
  product_price: z.number(),
  product_quantity: z.number(),
  product_variant_id: z.string().uuid(),
  product_variant_size: z.string(),
  product_variant_color: z.string(),
  product_variant_quantity: z.number(),
});

export type typeProductSchema = z.infer<typeof productSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  userId: z.string().uuid().optional(),
  cart: z.array(productSchema).optional(),
});

export const loginResellerSchema = z.object({
  email: z.string().email(),
});

export const saveCartSchema = z.object({
  cart: z.array(productSchema).optional(),
});

export const registerSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  userId: z.string().uuid(),
  cart: z.array(productSchema).optional(),
});

export const cartPostSchema = z.object({
  product_id: z.string().uuid(),
  product_name: z.string(),
  product_price: z.number(),
  product_quantity: z.number(),
  product_size: z.string(),
  product_variant_id: z.string().uuid(),
  product_variant_size: z.string(),
  product_variant_color: z.string(),
  product_variant_quantity: z.number(),
  product_variant_image: z.string(),
});

export type typeCartSchema = z.infer<typeof cartPostSchema>;

export const cartDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const cartPutSchema = z.object({
  id: z.string().uuid(),
  product_quantity: z.number(),
});

export type typeCartPutSchema = z.infer<typeof cartPutSchema>;

export const productVariantSchema = z.object({
  product_variant_color: z.string(),
  product_variant_id: z.string(),
  product_variant_product_id: z.string().uuid(),
  product_variant_slug: z.string(),
  product_variant_is_deleted: z.boolean().default(false),
  variant_sample_images: z.array(
    z.object({
      variant_sample_image_image_url: z.string(),
      variant_sample_image_product_variant_id: z.string(),
    })
  ),
  variant_sizes: z.array(
    z.object({
      variant_size_id: z.string(),
      variant_size_value: z.string(),
      variant_size_quantity: z.number(),
      variant_size_variant_id: z.string(),
    })
  ),
});

export const productCreateSchema = z.array(
  z.object({
    product_category_id: z.string(),
    product_description: z.string(),
    product_id: z.string().uuid(),
    product_name: z.string(),
    product_price: z.number(),
    product_sale_percentage: z.number(),
    product_slug: z.string(),
    product_team_id: z.string(),
    product_variants: z.array(productVariantSchema),
  })
);

export type typeProductCreateSchema = z.infer<typeof productCreateSchema>;

export const productCollectionSlugSchema = z.object({
  collectionSlug: z.string().min(1),
  take: z.number(),
  skip: z.number(),
  search: z.string().optional(),
  teamId: z.string().optional(),
});

export type typeProductCollectionSlugSchema = z.infer<
  typeof productCollectionSlugSchema
>;

export const orderGetListSchema = z.object({
  take: z.number(),
  skip: z.number(),
  search: z.string().optional(),
  dateFilter: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }),
  teamId: z.string().uuid(),
});

export type typeOrderGetListSchema = z.infer<typeof orderGetListSchema>;

export const userPostSchema = z.object({
  search: z.string().optional(),
  dateFilter: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }),
  sortDirection: z.string().optional(),
  columnAccessor: z.string().optional(),
  take: z.number(),
  skip: z.number(),
  teamId: z.string().uuid(),
});

export type typeUserPostSchema = z.infer<typeof userPostSchema>;

export const userVerifyResellerCodeSchema = z.object({
  otp: z.string().min(6).max(6),
});

export type typeUserVerifyResellerCodeSchema = z.infer<
  typeof userVerifyResellerCodeSchema
>;

export const resellerGetListSchema = z.object({
  take: z.coerce.number().min(1).max(15),
  skip: z.coerce.number().min(1),
});
