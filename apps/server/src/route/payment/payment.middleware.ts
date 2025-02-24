import { paymentCreatePaymentSchema, paymentSchema } from "@packages/shared";
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
const JWT_SECRET = process.env.JWT_SECRET || "your-strong-secret";

export const paymentMiddleware = async (c: Context, next: Next) => {
  const userData = c.get("user");
  const checkoutToken = getCookie(c, "checkout_token");
  let user: { role?: string } | null = null;
  try {
    if (userData?.role === "ANONYMOUS") {
      user = userData;
    } else {
      if (!checkoutToken) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      try {
        const decoded = await verify(checkoutToken, JWT_SECRET);
        const payload = decoded.payload as { role?: string };

        if (payload.role !== "MEMBER") {
          return c.json({ message: "Unauthorized" }, 401);
        }

        user = payload;
      } catch (error) {
        return c.json({ message: "Invalid checkout token" }, 401);
      }
    }
  } catch (error) {
    console.log(error);
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

  c.set("user", user);

  c.set("params", validate.data);

  return next();
};

export const paymentCreatePaymentMiddleware = async (
  c: Context,
  next: Next
) => {
  const userData = c.get("user");
  const checkoutToken = getCookie(c, "checkout_token");

  let user: { role?: string } | null = null;
  try {
    if (userData?.role === "ANONYMOUS") {
      user = userData;
    } else {
      if (!checkoutToken) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      try {
        const decoded = await verify(checkoutToken, JWT_SECRET);
        const payload = decoded.payload as { role?: string };

        if (payload.role !== "MEMBER") {
          return c.json({ message: "Unauthorized" }, 401);
        }

        user = payload;
      } catch (error) {
        return c.json({ message: "Invalid checkout token" }, 401);
      }
    }
  } catch (error) {}

  const { order_number, payment_method, payment_details, payment_type } =
    await c.req.json();

  const validate = paymentCreatePaymentSchema.safeParse({
    order_number,
    payment_method,
    payment_type,
    payment_details,
  });

  if (!validate.success) {
    console.log(validate.error.errors);
    return c.json(
      { message: "Invalid request", errors: validate.error.errors },
      400
    );
  }

  c.set("user", user);

  c.set("params", validate.data);

  return next();
};

export const paymentGetMiddleware = async (c: Context, next: Next) => {
  const userData = c.get("user");
  const checkoutToken = getCookie(c, "checkout_token");

  let user: { role?: string } | null = null;
  try {
    if (userData?.role === "ANONYMOUS") {
      user = userData;
    } else {
      if (!checkoutToken) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      try {
        const decoded = await verify(checkoutToken, JWT_SECRET);
        const payload = decoded.payload as { role?: string };

        if (payload.role !== "MEMBER") {
          return c.json({ message: "Unauthorized" }, 401);
        }

        user = payload;
      } catch (error) {
        return c.json({ message: "Invalid checkout token" }, 401);
      }
    }
  } catch (error) {}

  const { orderNumber } = c.req.param();
  const { paymentIntentId, clientKey } = c.req.query();

  if (!paymentIntentId) {
    return c.json({ message: "Invalid request" }, 400);
  }

  c.set("user", user);

  c.set("params", { paymentIntentId, clientKey, orderNumber });

  return next();
};
