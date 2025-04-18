import type { Context, Next } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { envConfig } from "../../env.js";
import { loginSchema, registerSchema } from "../../schema/schema.js";
import { rateLimit } from "../../utils/redis.js";
import { checkoutSchema } from "../../utils/schema.js";

const JWT_SECRET = envConfig.JWT_SECRET;

export const authLoginMiddleware = async (c: Context, next: Next) => {
  const { email, firstName, lastName, userId, cart } = await c.req.json();

  const parsed = loginSchema.safeParse({
    email,
    firstName,
    lastName,
    userId,
    cart,
  });

  if (!parsed.success) {
    return c.json({ message: "Invalid email or password" }, 400);
  }

  const isAllowed = await rateLimit(
    `rate-limit:${email}:login-post`,
    5,
    "1m",
    c
  );

  if (!isAllowed) {
    return c.json({ message: "Too many requests" }, 429);
  }
  c.set("params", parsed.data);

  await next();
};

export const authRegisterMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");

  const { email, firstName, lastName, cart } = await c.req.json();

  const parsed = registerSchema.safeParse({
    email,
    firstName,
    lastName,
    userId: user?.id,
    cart,
  });

  if (!parsed.success) {
    return c.json({ message: "Invalid email or password" }, 400);
  }

  const isAllowed = await rateLimit(
    `rate-limit:${user.id}:register-post`,
    5,
    "1m",
    c
  );

  if (!isAllowed) {
    return c.json({ message: "Too many requests" }, 429);
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

  const key = `checkout:${checkoutNumber}`;

  const isAllowed = await rateLimit(
    `rate-limit:${checkoutNumber}:checkout-post`,
    5,
    "1m",
    c
  );

  if (!isAllowed) {
    return c.json({ message: "Too many requests" }, 429);
  }
  c.set("params", parsed.data);

  await next();
};

export const verifyCheckoutTokenMiddleware = async (c: Context, next: Next) => {
  const token = getCookie(c, "checkout_token");
  const user = c.get("user");

  if (!token) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const isAllowed = await rateLimit(
    `rate-limit:${user.id}:checkout-post`,
    5,
    "1m",
    c
  );

  if (!isAllowed) {
    return c.json({ message: "Too many requests" }, 429);
  }

  c.set("token", token);

  await next();
};

export const handleLogoutMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");
  const token = getCookie(c, "auth_token");

  if (!token) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const decoded = await verify(token, JWT_SECRET);

  if (!decoded) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  if (decoded.role === "MEMBER" || decoded.role === "ADMIN") {
    c.set("user", decoded);
  } else {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();

  c.set("params", id);
  c.set("user", user);

  await next();
};
