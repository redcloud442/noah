import type { user_table } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { Resend } from "resend";
import prisma from "../../utils/prisma.js";
import type {
  CheckoutFormData,
  PaymentCreatePaymentFormData,
} from "../../utils/schema.js";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    referralCode,
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
      variant_sizes: {
        select: {
          variant_size_quantity: true,
        },
      },
    },
  });

  const productStockMap = new Map(
    existingProducts.map((product) => [
      product.product_variant_id,
      product.variant_sizes.reduce(
        (total, size) => total + size.variant_size_quantity,
        0
      ),
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

  const dataAmount = Math.round(amount * 100);

  const response = await axios.post(
    "https://api.paymongo.com/v1/payment_intents",
    {
      data: {
        attributes: {
          amount: dataAmount, // must be an integer in centavos
          payment_method_allowed: ["card", "dob", "paymaya", "gcash"],
          payment_method_options: {
            card: {
              request_three_d_secure: "any",
            },
          },
          currency: "PHP",
          capture_type: "automatic",
          description: `Payment for order ${order_number}`,
          statement_descriptor: "Order Payment",
        },
      },
    },
    {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY! + ":").toString("base64")}`,
      },
    }
  );

  if (response.status !== 200) {
    throw new Error("Failed to create payment intent");
  }

  const data = response.data;

  const paymentIntent = await prisma.$transaction(async (tx) => {
    let referral = null;
    if (referralCode) {
      const referralData = await prisma.reseller_table.findUnique({
        where: {
          reseller_code: referralCode ?? "",
        },
      });
      referral = referralData;
    }

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
        order_team_id: "16dcbf9a-1904-43f7-a98a-060f6903661d",
        order_reseller_id: referral ? referral.reseller_id : null,
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
        size: variant.product_variant_size,
        color: variant.product_variant_color,
      })),
    });

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

    let expiry_month, expiry_year;
    if (payment_details?.card.card_expiry) {
      [expiry_month, expiry_year] = payment_details.card.card_expiry.split("/");

      if (!expiry_month || !expiry_year) {
        throw new Error("Invalid card expiry format. Expected MM/YY");
      }

      // Convert to full year (e.g., "31" → 2031)
      if (expiry_year.length === 2) {
        expiry_year = `${expiry_year}`;
      }
    }

    const createPaymentMethod = await axios.post(
      "https://api.paymongo.com/v1/payment_methods",
      {
        data: {
          attributes: {
            type:
              payment_method === "card"
                ? "card"
                : payment_method === "online_banking"
                  ? "dob"
                  : payment_type?.toLowerCase(),
            details:
              payment_method === "card"
                ? {
                    card_number: payment_details?.card.card_number,
                    exp_month: parseInt(expiry_month ?? "0"),
                    exp_year: parseInt(expiry_year ?? "0"),
                    cvc: payment_details?.card.card_cvv,
                  }
                : payment_method === "online_banking"
                  ? {
                      bank_code:
                        payment_type?.toLowerCase() === "BPI" ? "bpi" : "ubp",
                    }
                  : undefined,
            billing: {
              address: {
                line1: orderDetails.order_address,
                city: orderDetails.order_city,
                state: orderDetails.order_state,
                postal_code: orderDetails.order_postal_code,
                country: "PH",
              },
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
          authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY! + ":").toString("base64")}`,
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
            return_url: `${process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://www.noir-clothing.com"}/payment/pn/${orderDetails.order_number}/redirect`,
          },
        },
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY! + ":").toString("base64")}`,
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
        order_status: "UNPAID",
      },
    });

    return {
      paymentStatus: attachPaymentMethod.data.data.attributes.status,
      nextAction: attachPaymentMethod.data.data.attributes.next_action,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
    }
    throw new Error("Payment process failed");
  }
};

export const getPayment = async (params: {
  paymentIntentId: string;
  clientKey: string;
  orderNumber: string;
}) => {
  try {
    const orderDetails = await prisma.order_table.findUnique({
      where: { order_number: params.orderNumber },
      include: {
        order_items: true,
      },
    });

    if (orderDetails?.order_status !== "UNPAID") {
      throw new Error("Payment already processed");
    }

    // 🔄 1️⃣ Retrieve Payment Intent
    const paymentIntent = await axios.get(
      `https://api.paymongo.com/v1/payment_intents/${params.paymentIntentId}?client_key=${params.clientKey}`,
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY! + ":").toString("base64")}`,
        },
      }
    );

    if (paymentIntent.status !== 200 || !paymentIntent.data.data) {
      throw new Error("Payment intent not found");
    }

    const paymentStatus = paymentIntent.data.data.attributes.status;

    let orderStatus: "PAID" | "CANCELED" | "PENDING" | "UNPAID" = "PENDING";

    switch (paymentStatus) {
      case "succeeded":
        orderStatus = "PAID";
        break;
      case "failed":
        orderStatus = "CANCELED";
        break;
      default:
        orderStatus = "UNPAID";
    }

    await prisma.$transaction(async (tx) => {
      const status = !!(await tx.order_table.findUnique({
        where: { order_number: params.orderNumber, order_status: "UNPAID" },
        select: { order_status: true },
      }));

      if (!status) {
        throw new Error("Payment already processed");
      }

      await tx.order_table.update({
        where: { order_number: params.orderNumber },
        data: { order_status: orderStatus },
      });
      if (orderStatus === "PAID") {
        if (orderDetails?.order_reseller_id) {
          const referral = await tx.reseller_table.findUnique({
            where: { reseller_id: orderDetails?.order_reseller_id ?? "" },
          });

          if (referral) {
            const referralAmount = (orderDetails?.order_total ?? 0) * 0.1;

            await tx.reseller_transaction_table.create({
              data: {
                reseller_transaction_reseller_id: referral.reseller_id,
                reseller_transaction_amount: referralAmount,
                reseller_transaction_type: "REFERRAL",
                reseller_transaction_status: "NON-WITHDRAWABLE",
              },
            });

            await tx.reseller_table.update({
              where: { reseller_id: referral.reseller_id },
              data: {
                reseller_non_withdrawable_earnings: {
                  increment: referralAmount,
                },
              },
            });
          }
        }
        await tx.cart_table.deleteMany({
          where: {
            cart_product_variant_id: {
              in: orderDetails?.order_items.map(
                (item) => item.product_variant_id
              ),
            },
            cart_size: {
              in: orderDetails?.order_items.map((item) => item.size ?? ""),
            },
            cart_user_id: orderDetails?.order_user_id ?? undefined,
            cart_to_be_checked_out: true,
          },
        });

        const updated = await tx.variant_size_table.updateMany({
          where: {
            variant_size_variant_id: {
              in: orderDetails?.order_items.map(
                (item) => item.product_variant_id
              ),
            },
            variant_size_value: {
              in: orderDetails?.order_items.map((item) => item.size ?? ""),
            },
          },
          data: {
            variant_size_quantity: {
              decrement: orderDetails?.order_items.reduce(
                (total, item) => total + item.quantity,
                0
              ),
            },
          },
        });

        await resend.emails.send({
          from: "Noir Clothing <no-reply@help.noir-clothing.com>",
          to: orderDetails?.order_email ?? "",
          subject: "Payment confirmed — Your order is on its way!",
          text: `Hi there! Your payment has been successfully processed. Order #${orderDetails?.order_number} is now being prepared for shipment. Track your order at noir-clothing.com/track/${orderDetails?.order_number}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            
              <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 32px; text-align: center;">
                <div style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 2px;">NOIR</div>
                <div style="color: #a3a3a3; font-size: 12px; font-weight: 500; letter-spacing: 1px; margin-top: 4px;">CLOTHING</div>
              </div>
              
     
              <div style="text-align: center; padding: 32px 0 24px;">
                <h1 style="color: #111827; font-size: 28px; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.5px;">Payment Confirmed</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 0;">Your order is being prepared for shipment</p>
              </div>
            
              <div style="margin: 0 32px 32px; padding: 24px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
                <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 16px;">Order Details</h3>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <span style="color: #6b7280; font-size: 14px;">Order Number</span>
                  <span style="color: #111827; font-size: 14px; font-weight: 600; font-family: 'SF Mono', Monaco, monospace;"> #${orderDetails?.order_number || "N/A"}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <span style="color: #6b7280; font-size: 14px;">Order Date</span>
                  <span style="color: #111827; font-size: 14px; font-weight: 500;">${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #6b7280; font-size: 14px;">Status</span>
                  <span style="display: inline-flex; align-items: center; padding: 4px 8px; background: #dcfce7; color: #166534; font-size: 12px; font-weight: 600; border-radius: 6px;">
                    <div style="width: 6px; height: 6px; background: #22c55e; border-radius: 50%; margin-right: 6px;"></div>
                    PAID
                  </span>
                </div>
              </div>
            </div>
          `,
        });
      } else {
        await resend.emails.send({
          from: "Noir Clothing <no-reply@help.noir-clothing.com>",
          to: orderDetails?.order_email ?? "",
          subject: "Payment issue — Let's get this sorted",
          text: `Hi there, we encountered an issue processing your payment. Please try again or contact our support team at support@noir-clothing.com if you need assistance.`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
              <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 32px; text-align: center;">
                <div style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 2px;">NOIR</div>
                <div style="color: #a3a3a3; font-size: 12px; font-weight: 500; letter-spacing: 1px; margin-top: 4px;">CLOTHING</div>
              </div>
              
              <!-- Error Icon -->
              <div style="text-align: center; padding: 32px 0 24px;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: #fef2f2; border: 2px solid #fecaca; border-radius: 50%; margin-bottom: 16px;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <h1 style="color: #111827; font-size: 28px; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.5px;">Payment Issue</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 0;">We encountered a problem processing your payment</p>
              </div>
              
              <!-- Issue Details -->
              <div style="margin: 0 32px 32px; padding: 24px; background: #fef2f2; border-radius: 12px; border: 1px solid #fecaca;">
                <h3 style="color: #991b1b; font-size: 18px; font-weight: 600; margin: 0 0 12px;">What happened?</h3>
                <p style="color: #7f1d1d; font-size: 14px; margin: 0 0 16px; line-height: 1.5;">Your payment could not be processed at this time. This could be due to insufficient funds, an expired card, or a temporary issue with your payment method.</p>
              </div>       
            </div>
            `,
        });

        await tx.variant_size_table.updateMany({
          where: {
            variant_size_variant_id: {
              in: orderDetails?.order_items.map(
                (item) => item.product_variant_id
              ),
            },
            variant_size_value: {
              in: orderDetails?.order_items.map((item) => item.size ?? ""),
            },
          },
          data: {
            variant_size_quantity: {
              increment: orderDetails?.order_items.reduce(
                (total, item) => total + item.quantity,
                0
              ),
            },
          },
        });
      }
    });

    return { orderStatus, paymentStatus };
  } catch (error) {
    throw new Error("Failed to retrieve payment status");
  }
};
