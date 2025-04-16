import { paymentCreatePaymentSchema, paymentSchema } from "@packages/shared";
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { redis } from "../../utils/redis.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-strong-secret";

export const paymentMiddleware = async (c: Context, next: Next) => {
  const userData = c.get("user");
  const authToken = getCookie(c, "auth_token");
  let user: { role?: string } | null = null;

  if (!userData) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  if (userData && authToken) {
    const decoded = await verify(authToken, JWT_SECRET);
    const payload = decoded as { role?: string; email?: string; id?: string };
    user = payload;
  } else if (userData && !authToken) {
    user = userData;
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

  const key = `payment:${userData.id}`;

  const isRateLimited = await redis.rateLimit(key, 100, 60);

  if (isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  c.set("user", user);

  c.set("params", validate.data);

  await next();
};

export const paymentCreatePaymentMiddleware = async (
  c: Context,
  next: Next
) => {
  const userData = c.get("user");
  const authToken = getCookie(c, "auth_token");

  let user: { role?: string } | null = null;

  if (userData && authToken) {
    const decoded = await verify(authToken, JWT_SECRET);
    const payload = decoded as { role?: string; email?: string; id?: string };
    user = payload;
  } else if (userData && !authToken) {
    user = userData;
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

  const key = `payment-create:${userData.id}`;

  const isRateLimited = await redis.rateLimit(key, 100, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  c.set("user", user);

  c.set("params", validate.data);

  await next();
};

export const paymentGetMiddleware = async (c: Context, next: Next) => {
  const userData = c.get("user");
  const authToken = getCookie(c, "auth_token");
  let user: { role?: string } | null = null;

  if (userData && authToken) {
    const decoded = await verify(authToken, JWT_SECRET);
    const payload = decoded as { role?: string; email?: string; id?: string };
    user = payload;
  } else if (userData && !authToken) {
    user = userData;
  }

  const { orderNumber } = c.req.param();
  const { paymentIntentId, clientKey } = c.req.query();

  if (!paymentIntentId) {
    return c.json({ message: "Invalid request" }, 400);
  }

  const key = `payment:${userData.id}-get`;

  const isRateLimited = await redis.rateLimit(key, 100, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  c.set("user", user);

  c.set("params", { paymentIntentId, clientKey, orderNumber });

  await next();
};
