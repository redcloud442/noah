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
