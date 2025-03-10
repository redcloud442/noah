import type {
  CheckoutFormData,
  PaymentCreatePaymentFormData,
} from "@packages/shared";
import type { user_table } from "@prisma/client";
import axios from "axios";
import prisma from "../../utils/prisma.js";

export const createPaymentIntent = async (
  params: CheckoutFormData,
  user: user_table & { id: string }
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
    barangay,
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

  console.log(user);

  const paymentIntent = await prisma.$transaction(async (tx) => {
    const paymentIntent = await tx.order_table.create({
      data: {
        order_user_id: user.id ? user.id : null,
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
        order_barangay: barangay,
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

    if (user.id) {
      await tx.cart_table.deleteMany({
        where: {
          cart_product_variant_id: {
            in: productVariant.map((variant) => variant.product_variant_id),
          },
          cart_user_id: user.id ?? null,
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

export const createPaymentMethod = async (
  params: PaymentCreatePaymentFormData
) => {
  try {
    const { order_number, payment_method, payment_type } = params;

    const payment_details =
      payment_method === "card" ? params.payment_details : undefined;

    const orderDetails = await prisma.order_table.findUnique({
      where: { order_number },
    });

    if (!orderDetails) {
      throw new Error("Order not found");
    }

    let expiry_year, expiry_month;
    if (payment_details?.card.card_expiry) {
      [expiry_year, expiry_month] = payment_details.card.card_expiry.split("/");
      if (!expiry_year || !expiry_month) {
        throw new Error("Invalid card expiry format. Expected YYYY-MM");
      }
    }

    // Create Payment Method
    const createPaymentMethod = await axios.post(
      "https://api.paymongo.com/v1/payment_methods",
      {
        data: {
          attributes: {
            type:
              payment_method === "card" ? "card" : payment_type?.toLowerCase(),
            details:
              payment_method === "card"
                ? {
                    card: {
                      number: payment_details?.card.card_number,
                      expiry_month,
                      expiry_year,
                      cvv: payment_details?.card.card_cvv,
                    },
                  }
                : undefined,
            billing: {
              name: `${orderDetails.order_first_name} ${orderDetails.order_last_name}`,
              email: orderDetails.order_email,
              phone: orderDetails.order_phone,
            },
          },
        },
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Basic ${process.env.PAYMONGO_SECRET_KEY}`,
        },
      }
    );

    if (createPaymentMethod.status !== 200) {
      throw new Error("Failed to create payment method");
    }

    // Attach Payment Method
    const attachPaymentMethod = await axios.post(
      `https://api.paymongo.com/v1/payment_intents/${orderDetails.order_payment_id}/attach`,
      {
        data: {
          attributes: {
            payment_method: createPaymentMethod.data.data.id,
            client_key: createPaymentMethod.data.data.attributes.client_key,
            return_url: `http://localhost:3000/payment/pn/${orderDetails.order_number}/redirect`,
          },
        },
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Basic ${process.env.PAYMONGO_SECRET_KEY}`,
        },
      }
    );

    if (attachPaymentMethod.status !== 200) {
      throw new Error("Failed to attach payment method");
    }

    await prisma.order_table.update({
      where: { order_number },
      data: {
        order_payment_method_id: createPaymentMethod.data.data.id,
        order_payment_method:
          payment_method === "card" ? "card" : payment_type?.toLowerCase(),
        order_status: "PENDING",
      },
    });

    return {
      paymentStatus: attachPaymentMethod.data.data.attributes.status,
      nextAction: attachPaymentMethod.data.data.attributes.next_action,
    };
  } catch (error) {
    throw new Error("Payment process failed");
  }
};

export const getPayment = async (params: {
  paymentIntentId: string;
  clientKey: string;
  orderNumber: string;
}) => {
  try {
    // 🔄 1️⃣ Retrieve Payment Intent
    const paymentIntent = await axios.get(
      `https://api.paymongo.com/v1/payment_intents/${params.paymentIntentId}?client_key=${params.clientKey}`,
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Basic ${process.env.PAYMONGO_SECRET_KEY}`,
        },
      }
    );

    if (paymentIntent.status !== 200 || !paymentIntent.data.data) {
      throw new Error("Payment intent not found");
    }

    const paymentStatus = paymentIntent.data.data.attributes.status;

    let orderStatus: "PAID" | "CANCELED" | "PENDING" = "PENDING";

    switch (paymentStatus) {
      case "succeeded":
        orderStatus = "PAID";
        break;
      case "failed":
        orderStatus = "CANCELED";
        break;
      default:
        orderStatus = "PENDING";
    }

    await prisma.order_table.update({
      where: { order_number: params.orderNumber },
      data: { order_status: orderStatus },
    });

    return { orderStatus, paymentStatus };
  } catch (error) {
    throw new Error("Failed to retrieve payment status");
  }
};
