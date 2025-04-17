import type { Context } from "hono";

import type { Next } from "hono";
import {
  cartDeleteSchema,
  cartPostSchema,
  cartPutSchema,
} from "../../schema/schema.js";
import { redis } from "../../utils/redis.js";

export const cartMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const isRateLimited = await redis.rateLimit(user.id, 100, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  if (
    user.user_metadata.role !== "ADMIN" &&
    user.user_metadata.role !== "MEMBER"
  ) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  await next();
};

export const cartPostMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const isRateLimited = await redis.rateLimit(user.id, 100, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  if (
    user.user_metadata.role !== "ADMIN" &&
    user.user_metadata.role !== "MEMBER"
  ) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const params = await c.req.json();

  const validated = cartPostSchema.safeParse(params);

  if (!validated.success) {
    return c.json({ message: "Invalid request" }, 400);
  }

  c.set("params", validated.data);

  await next();
};

export const cartDeleteMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const isRateLimited = await redis.rateLimit(user.id, 100, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  if (
    user.user_metadata.role !== "MEMBER" &&
    user.user_metadata.role !== "ADMIN"
  ) {
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

  await next();
};

export const cartPutMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");

  const isRateLimited = await redis.rateLimit(user.id, 100, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  if (
    user.user_metadata.role !== "ADMIN" &&
    user.user_metadata.role !== "MEMBER"
  ) {
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

  await next();
};
