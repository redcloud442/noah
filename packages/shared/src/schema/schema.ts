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
