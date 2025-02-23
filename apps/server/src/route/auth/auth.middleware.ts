import { checkoutSchema } from "@packages/shared";
import type { Context, Next } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import { loginSchema, registerSchema } from "../../schema/schema.js";

export const authLoginMiddleware = async (c: Context, next: Next) => {
  const { email, firstName, lastName, userId } = await c.req.json();

  const parsed = loginSchema.safeParse({ email, firstName, lastName, userId });

  if (!parsed.success) {
    return c.json({ message: "Invalid email or password" }, 400);
  }

  c.set("params", parsed.data);

  await next();
};

export const authRegisterMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");

  const { email, firstName, lastName } = await c.req.json();

  const parsed = registerSchema.safeParse({
    email,
    firstName,
    lastName,
    userId: user?.id,
  });

  if (!parsed.success) {
    return c.json({ message: "Invalid email or password" }, 400);
  }

  c.set("params", parsed.data);

  await next();
};

export const authLogoutMiddleware = async (c: Context, next: Next) => {
  deleteCookie(c, "auth_token");

  await next();
};

export const createCheckoutTokenMiddleware = async (c: Context, next: Next) => {
  const { checkoutNumber } = await c.req.json();

  const parsed = checkoutSchema.safeParse({ checkoutNumber });

  if (!parsed.success) {
    return c.json({ message: "Invalid checkout number" }, 400);
  }

  c.set("params", parsed.data);

  await next();
};

export const verifyCheckoutTokenMiddleware = async (c: Context, next: Next) => {
  const token = getCookie(c, "checkout_token");

  if (!token) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  c.set("token", token);

  await next();
};
