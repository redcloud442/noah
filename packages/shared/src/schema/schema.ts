import { z } from "zod";

//checkout schema
export const checkoutSchema = z.object({
  checkoutNumber: z.string().min(8).max(8),
});

//payment schema
export const paymentSchema = z
  .object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    address: z.string(),
    province: z.string(),
    city: z.string(),
    barangay: z.string(),
    postalCode: z.string(),
    phone: z.string(),
    amount: z.number(),
    order_number: z.string(),
    productVariant: z.array(
      z.object({
        product_variant_id: z.string(),
        product_variant_quantity: z.number(),
        product_variant_price: z.number(),
        product_variant_size: z.string(),
        product_variant_color: z.string(),
      })
    ),
  })
  .strict();

export type CheckoutFormData = z.infer<typeof paymentSchema>;

export const cardPaymentSchema = z.object({
  order_number: z.string().min(8).max(8),
  payment_method: z.literal("card"),
  payment_details: z.object({
    card: z.object({
      card_number: z.string().min(16).max(16),
      card_expiry: z.string().min(5).max(5),
      card_cvv: z.string().min(3).max(3),
    }),
  }),
  payment_type: z
    .enum(["GCash", "GrabPay", "PayMaya", "BPI", "UnionBank"])
    .optional(),
});

export const nonCardPaymentSchema = z.object({
  order_number: z.string().min(8).max(8),
  payment_method: z.enum(["e_wallet", "online_banking"]),
  payment_type: z
    .enum(["GCash", "GrabPay", "PayMaya", "BPI", "UnionBank"])
    .optional(),
});

export const paymentCreatePaymentSchema = z.discriminatedUnion(
  "payment_method",
  [cardPaymentSchema, nonCardPaymentSchema]
);

export type PaymentCreatePaymentFormData = z.infer<
  typeof paymentCreatePaymentSchema
>;

export const orderGetSchema = z.object({
  take: z.number().min(1).max(15),
  skip: z.number().min(0),
});

export type OrderGetParams = z.infer<typeof orderGetSchema>;

export const addressCreateSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  address: z.string(),
  province: z.string(),
  city: z.string(),
  barangay: z.string(),
  postalCode: z.string(),
  phone: z.string(),
  is_default: z.boolean(),
});

export type AddressCreateFormData = z.infer<typeof addressCreateSchema>;

//product collection schema
export const productCollectionSchema = z.object({
  search: z.string().optional(),
  take: z.number().min(1).max(15),
  skip: z.number().min(0),
});

//product category schema
export const productCategorySchema = z.object({
  productCategoryName: z.string().min(1, "Product category name is required"),
  productCategoryDescription: z.string().optional(),
  teamId: z.string().optional(),
  image: z
    .instanceof(File)
    .refine((file) => !!file, { message: "File is required" })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/jpg"].includes(file.type) &&
        file.size <= 12 * 1024 * 1024, // 12MB limit
      { message: "File must be a valid image and less than 12MB." }
    ),
});

export type ProductCategoryForm = z.infer<typeof productCategorySchema>;

export const productSchema = z.object({
  products: z.array(
    z.object({
      name: z.string().min(1, "Product name is required"),
      price: z.coerce
        .number()
        .min(1, "Price must be greater than 0")
        .optional(),
      description: z.string().optional(),
      category: z.string().min(1, "Category is required").optional(),
      variants: z.array(
        z.object({
          id: z.string().uuid("ID must be a valid UUID"),
          color: z.string().min(1, "Color is required"),
          sizesWithQuantities: z.array(
            z.object({
              size: z.string().min(1, "Size is required"),
              quantity: z.number().min(1, "Quantity is required"),
            })
          ),
          images: z
            .array(
              z
                .instanceof(File)
                .optional()
                .refine((file) => !!file, { message: "File is required" })
                .refine(
                  (file) =>
                    ["image/jpeg", "image/png", "image/jpg"].includes(
                      file.type
                    ) && file.size <= 12 * 1024 * 1024, // 12MB limit
                  { message: "File must be a valid image and less than 12MB." }
                )
                .optional()
            )
            .optional(),
          publicUrl: z.array(z.string()).optional(),
          isDeleted: z.boolean().optional(),
        })
      ),
    })
  ),
});

export type ProductFormType = z.infer<typeof productSchema>;

export const productVariantSchema = z.object({
  product_variant_color: z.string().uuid(),
  product_variant_id: z.string(),
  product_variant_product_id: z.string(),
  product_variant_quantity: z.number(),
  product_variant_size: z.string(),
  product_variant_slug: z.string(),
  variant_sample_images: z.array(
    z.object({
      variant_sample_image_image_url: z.string(),
      variant_sample_image_product_variant_id: z.string(),
    })
  ),
});

export const productCreateSchema = z.object({
  product_category_id: z.string(),
  product_description: z.string(),
  product_id: z.number(),
  product_name: z.string(),
  product_price: z.number(),
  product_sale_percentage: z.number(),
  product_slug: z.string(),
  product_team_id: z.string(),
  product_variants: z.array(productVariantSchema),
});

export type typeProductCreateSchema = z.infer<typeof productCreateSchema>;
