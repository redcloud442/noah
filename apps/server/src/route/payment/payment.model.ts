import type { CheckoutFormData } from "@packages/shared";
import type { user_table } from "@prisma/client";
import axios from "axios";
import prisma from "../../utils/prisma.js";

export const createPaymentIntent = async (
  params: CheckoutFormData,
  user: user_table
) => {
  const {
    amount,
    productVariant,
    order_number,
    email,
    firstName,
    lastName,
    phone,
    address,
    city,
    province,
    postalCode,
  } = params;

  const productVariantIds = productVariant.map(
    (item) => item.product_variant_id
  );

  const existingProducts = await prisma.product_variant_table.findMany({
    where: {
      product_variant_id: { in: productVariantIds },
    },
    select: {
      product_variant_id: true,
      product_variant_quantity: true,
    },
  });

  const productStockMap = new Map(
    existingProducts.map((product) => [
      product.product_variant_id,
      product.product_variant_quantity,
    ])
  );

  for (const item of productVariant) {
    const availableStock = productStockMap.get(item.product_variant_id);
    if (availableStock === undefined) {
      throw new Error(`Product variant ${item.product_variant_id} not found.`);
    }
    if (availableStock < item.product_variant_quantity) {
      throw new Error(
        `Insufficient stock for product ${item.product_variant_id}.`
      );
    }
  }

  const dataAmount = amount + 10000;

  const response = await axios.post(
    "https://api.paymongo.com/v1/payment_intents",
    {
      data: {
        attributes: {
          amount: dataAmount,
          payment_method_allowed: [
            "qrph",
            "card",
            "dob",
            "paymaya",
            "billease",
            "gcash",
            "grab_pay",
          ],
          payment_method_options: { card: { request_three_d_secure: "any" } },
          currency: "PHP",
          capture_type: "automatic",
        },
      },
    },
    {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Basic c2tfdGVzdF9HcDNBRzk3TWZqb2tqTG5IWG5qejkzcEY6`,
      },
    }
  );

  const data = response.data;

  const paymentIntent = await prisma.$transaction(async (tx) => {
    const paymentIntent = await tx.order_table.create({
      data: {
        order_user_id: user.user_id ?? null,
        order_number: order_number,
        order_status: "PENDING",
        order_total: amount,
        order_payment_id: data.data.id,
        order_email: email,
        order_first_name: firstName,
        order_last_name: lastName,
        order_phone: phone,
        order_address: address,
        order_city: city,
        order_state: province,
        order_postal_code: postalCode,
      },
      select: {
        order_id: true,
      },
    });

    await tx.order_item_table.createMany({
      data: productVariant.map((variant) => ({
        order_id: paymentIntent.order_id,
        product_variant_id: variant.product_variant_id,
        quantity: variant.product_variant_quantity,
        price: variant.product_variant_price,
      })),
    });

    if (user.user_id) {
      await tx.cart_table.deleteMany({
        where: {
          cart_product_variant_id: {
            in: productVariant.map((variant) => variant.product_variant_id),
          },
          cart_user_id: user.user_id ?? null,
        },
      });
    }

    return {
      paymentIntent: data.data.id,
      paymentIntentStatus: data.data.attributes.status,
      order_id: paymentIntent.order_id,
      order_number: order_number,
    };
  });

  return {
    paymentIntent: data.data.id,
    paymentIntentStatus: "SUCCESS",
    order_id: paymentIntent.order_id,
    order_number: order_number,
    order_status: "PENDING",
    order_total: amount,
  };
};
