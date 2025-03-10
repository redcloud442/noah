import type { Context } from "hono";

import type { Next } from "hono";
import { getCookie } from "hono/cookie";
import { decode } from "hono/jwt";
import {
  cartDeleteSchema,
  cartPostSchema,
  cartPutSchema,
} from "../../schema/schema.js";
import { redis } from "../../utils/redis.js";

export const cartMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");
  const token = getCookie(c, "auth_token");

  if (!token) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const decoded = decode(token);

  if (!decoded) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const isRateLimited = await redis.rateLimit(user.id, 100, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  if (decoded.payload.role === "MEMBER" || decoded.payload.role === "ADMIN") {
    c.set("user", user);
  } else {
    return c.json({ message: "Unauthorized" }, 401);
  }

  return next();
};

export const cartPostMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");
  const token = getCookie(c, "auth_token");

  if (!token) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const decoded = decode(token);

  if (!decoded) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const isRateLimited = await redis.rateLimit(user.id, 100, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  if (decoded.payload.role === "MEMBER" || decoded.payload.role === "ADMIN") {
    c.set("user", user);
  } else {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const params = await c.req.json();

  const validated = cartPostSchema.safeParse(params);

  if (!validated.success) {
    return c.json({ message: "Invalid request" }, 400);
  }

  c.set("params", validated.data);

  return next();
};

export const cartDeleteMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");
  const token = getCookie(c, "auth_token");

  if (!token) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const decoded = decode(token);

  if (!decoded) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const isRateLimited = await redis.rateLimit(user.id, 100, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  if (decoded.payload.role === "MEMBER" || decoded.payload.role === "ADMIN") {
    c.set("user", user);
  } else {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const params = c.req.param("id");

  const validated = cartDeleteSchema.safeParse({
    id: params,
  });

  if (!validated.success) {
    return c.json({ message: "Invalid request" }, 400);
  }

  c.set("params", validated.data);

  return next();
};

export const cartPutMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");
  const token = getCookie(c, "auth_token");

  if (!token) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const decoded = decode(token);

  if (!decoded) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const isRateLimited = await redis.rateLimit(user.id, 100, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  if (decoded.payload.role === "MEMBER" || decoded.payload.role === "ADMIN") {
    c.set("user", user);
  } else {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const params = c.req.param("id");
  const { product_quantity } = await c.req.json();

  const validated = cartPutSchema.safeParse({
    id: params,
    product_quantity: product_quantity,
  });

  if (!validated.success) {
    return c.json({ message: "Invalid request" }, 400);
  }

  c.set("params", validated.data);

  return next();
};
