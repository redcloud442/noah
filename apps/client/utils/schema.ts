import { z } from "zod";

//checkout schema
export const checkoutSchema = z.object({
  checkoutNumber: z.string().min(8).max(8),
});

//payment schema
export const paymentSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(4, "First name is required"),
    lastName: z.string().min(4, "Last name is required"),
    address: z.string().min(4, "Address is required"),
    province: z.object({
      province_id: z.string(),
      province_name: z.string(),
      province_rate: z.string(),
    }),
    city: z.object({
      municipality_id: z.string(),
      municipality_name: z.string(),
      province_id: z.string(),
    }),
    shippingOption: z.string().min(4, "Shipping option is required"),
    barangay: z.object({
      barangay_id: z.string(),
      barangay_name: z.string(),
      municipality_id: z.string(),
    }),
    postalCode: z.string().min(4, "Postal code is required"),
    phone: z.string().min(10, "Phone number is required"),
    amount: z.number().min(4, "Amount is required"),
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
      card_number: z
        .string()
        .trim()
        .min(16, "Card number must be 16 digits")
        .max(16, "Card number must be 16 digits")
        .regex(/^4[0-9]{15}$/, "Must be a valid Visa card number"),
      card_expiry: z
        .string()
        .trim()
        .min(5, "Expiry must be MM/YY")
        .max(5, "Expiry must be MM/YY")
        .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry format"),
      card_cvv: z
        .string()
        .trim()
        .min(3, "CVV must be 3 digits")
        .max(3, "CVV must be 3 digits")
        .regex(/^\d{3}$/, "Invalid CVV"),
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
    .enum([
      "GCash",
      "GrabPay",
      "PayMaya",
      "BPI",
      "UnionBank",
      "Visa",
      "Mastercard",
    ])
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
  shippingOption: z.string().min(4, "Shipping option is required"),
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
      id: z.string().optional(),
      name: z.string().min(1, "Product name is required"),
      price: z.coerce.number().min(1, "Price must be greater than 0"),
      description: z.string().optional(),
      category: z.string().min(1, "Category is required"),
      sizeGuide: z.any().optional().nullable(),
      sizeGuideUrl: z.string().nullable().or(z.literal("")),
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
          images: z.array(z.any()).optional().nullable(),

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
  product_variant_size_guide_url: z.string().optional(),
  variant_sample_images: z.array(
    z.object({
      variant_sample_image_image_url: z.string(),
      variant_sample_image_product_variant_id: z.string(),
    })
  ),
});

export type ProductVariantFormType = z.infer<typeof productVariantSchema>;

export const productCreateSchema = z.object({
  product_category_id: z.string(),
  product_description: z.string(),
  product_id: z.string().optional(),
  product_name: z.string(),
  product_price: z.number(),
  product_sale_percentage: z.number(),
  product_slug: z.string(),
  product_team_id: z.string(),
  product_variants: z.array(productVariantSchema),
  product_size_guide_url: z.string().optional(),
});

export type typeProductCreateSchema = z.infer<typeof productCreateSchema>;

export const productGetAllProductSchema = z.object({
  take: z.number().min(1).max(15),
  skip: z.number().min(1),
  search: z.string().optional(),
  teamId: z.string().optional(),
  category: z.string().optional(),
});

export type ProductGetAllProductSchema = z.infer<
  typeof productGetAllProductSchema
>;

export const withdrawalListSchema = z.object({
  take: z.coerce.number().min(1).max(100),
  skip: z.coerce.number().min(0),
  search: z.string().optional(),
  sortDirection: z.string().optional(),
  columnAccessor: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  teamId: z.string().uuid(),
  dateFilter: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }),
});

export type typeWithdrawalListSchema = z.infer<typeof withdrawalListSchema>;

export const dashboardSchema = z.object({
  dateFilter: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }),
  teamId: z.string().uuid(),
});

export type typeDashboardSchema = z.infer<typeof dashboardSchema>;

export const userChangePasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UserChangePasswordFormData = z.infer<
  typeof userChangePasswordSchema
>;
