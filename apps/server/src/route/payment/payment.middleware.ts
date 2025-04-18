import type { Context, Next } from "hono";
import { rateLimit } from "../../utils/redis.js";
import {
  paymentCreatePaymentSchema,
  paymentSchema,
} from "../../utils/schema.js";

export const paymentMiddleware = async (c: Context, next: Next) => {
  const userData = c.get("user");

  if (!userData) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  if (
    userData.user_metadata.role !== "MEMBER" &&
    userData.user_metadata.role !== "ADMIN"
  ) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const {
    order_number,
    email,
    firstName,
    lastName,
    phone,
    amount,
    barangay,
    address,
    city,
    province,
    postalCode,
    productVariant,
  } = await c.req.json();

  const validate = paymentSchema.safeParse({
    order_number,
    email,
    firstName,
    lastName,
    phone,
    address,
    city,
    barangay,
    amount,
    province,
    postalCode,
    productVariant,
  });

  if (!validate.success) {
    return c.json(
      { message: "Invalid request", errors: validate.error.errors },
      400
    );
  }

  const isAllowed = await rateLimit(
    `rate-limit:${userData.id}:payment-create`,
    50,
    "1m",
    c
  );

  if (!isAllowed) {
    return c.json({ message: "Too many requests" }, 429);
  }

  c.set("params", validate.data);
  c.set("user", userData);

  await next();
};

export const paymentCreatePaymentMiddleware = async (
  c: Context,
  next: Next
) => {
  const userData = c.get("user");

  if (
    userData.user_metadata.role !== "MEMBER" &&
    userData.user_metadata.role !== "ADMIN"
  ) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const { order_number, payment_method, payment_details, payment_type } =
    await c.req.json();

  const validate = paymentCreatePaymentSchema.safeParse({
    order_number,
    payment_method,
    payment_type,
    payment_details,
  });

  if (!validate.success) {
    return c.json(
      { message: "Invalid request", errors: validate.error.errors },
      400
    );
  }

  const isAllowed = await rateLimit(
    `rate-limit:${userData.id}:payment-create`,
    50,
    "1m",
    c
  );

  if (!isAllowed) {
    return c.json({ message: "Too many requests" }, 429);
  }

  c.set("params", validate.data);
  c.set("user", userData);

  await next();
};

export const paymentGetMiddleware = async (c: Context, next: Next) => {
  const userData = c.get("user");

  if (
    userData.user_metadata.role !== "MEMBER" &&
    userData.user_metadata.role !== "ADMIN"
  ) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const { orderNumber } = c.req.param();
  const { paymentIntentId, clientKey } = c.req.query();

  if (!paymentIntentId) {
    return c.json({ message: "Invalid request" }, 400);
  }

  const isAllowed = await rateLimit(
    `rate-limit:${userData.id}:payment-get`,
    50,
    "1m",
    c
  );

  if (!isAllowed) {
    return c.json({ message: "Too many requests" }, 429);
  }

  c.set("params", { paymentIntentId, clientKey, orderNumber });

  await next();
};
