import {
  productCategorySchema,
  productCollectionSchema,
} from "@packages/shared";
import type { Context, Next } from "hono";
import { adminAuthProtection } from "../../middleware/auth.middleware.js";
import {
  productCollectionSlugSchema,
  productCreateSchema,
} from "../../schema/schema.js";
import { redis } from "../../utils/redis.js";
import { productGetAllProductSchema } from "../../utils/schema.js";

export const productCollectionMiddleware = async (c: Context, next: Next) => {
  await adminAuthProtection(c);

  const { search, take, skip, teamId } = c.req.query();

  const takeNumber = Number(take);
  const skipNumber = Number(skip);

  const validate = productCollectionSchema.safeParse({
    search,
    take: takeNumber,
    skip: skipNumber,
    teamId,
  });

  if (!validate.success) {
    return c.json({ message: "Invalid request" }, 400);
  }

  c.set("params", validate.data);

  return next();
};

export const productCollectionsPostMiddleware = async (
  c: Context,
  next: Next
) => {
  await adminAuthProtection(c);

  const { productCategoryName, productCategoryDescription, teamId } =
    await c.req.json();

  const validate = productCategorySchema.safeParse({
    productCategoryName,
    productCategoryDescription,
    teamId,
  });

  if (!validate.success) {
    return c.json({ message: "Invalid request" }, 400);
  }

  c.set("params", validate.data);

  return next();
};

export const productCreateMiddleware = async (c: Context, next: Next) => {
  const user = await adminAuthProtection(c);

  const key = `product:${user.id}-create`;

  const isRateLimited = await redis.rateLimit(key, 100, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  const body = await c.req.json();

  const validate = productCreateSchema.safeParse(body);

  if (!validate.success) {
    return c.json({ message: "Invalid request" }, 400);
  }

  c.set("params", validate.data);

  return next();
};

export const productCollectionSlugMiddleware = async (
  c: Context,
  next: Next
) => {
  const user = await adminAuthProtection(c);

  const key = `product:${user.id}-collection-slug`;

  const isRateLimited = await redis.rateLimit(key, 100, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  const { params } = await c.req.json();

  const validate = productCollectionSlugSchema.safeParse(params);

  if (!validate.success) {
    return c.json({ message: "Invalid request" }, 400);
  }

  c.set("params", validate.data);

  return next();
};

export const productGetAllProductMiddleware = async (
  c: Context,
  next: Next
) => {
  await adminAuthProtection(c);

  const { params } = await c.req.json();

  const validate = productGetAllProductSchema.safeParse(params);

  if (!validate.success) {
    return c.json({ message: "Invalid request" }, 400);
  }

  c.set("params", validate.data);

  return await next();
};
