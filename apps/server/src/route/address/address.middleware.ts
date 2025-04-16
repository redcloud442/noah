import { addressCreateSchema, orderGetSchema } from "@packages/shared";
import type { Context, Next } from "hono";
import { redis } from "../../utils/redis.js";

export const addressGetMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");

  const isRateLimited = await redis.rateLimit(user.id, 10, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const { take, skip } = c.req.query();

  const takeNumber = Number(take);
  const skipNumber = Number(skip);

  const validated = orderGetSchema.safeParse({
    take: takeNumber,
    skip: skipNumber,
  });

  if (!validated.success) {
    return c.json({ message: "Invalid request" }, 400);
  }

  c.set("params", validated.data);
  c.set("user", user);

  await next();
};

export const addressCreateMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");

  const isRateLimited = await redis.rateLimit(user.id, 10, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  const params = await c.req.json();

  const validated = addressCreateSchema.safeParse(params);

  if (!validated.success) {
    return c.json({ message: "Invalid request" }, 400);
  }

  c.set("params", validated.data);
  c.set("user", user);

  await next();
};

export const addressPutDefaultMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");

  const isRateLimited = await redis.rateLimit(user.id, 10, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();

  c.set("params", id);
  c.set("user", user);

  await next();
};

export const addressDeleteMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");

  const isRateLimited = await redis.rateLimit(user.id, 10, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();

  c.set("params", id);
  c.set("user", user);

  await next();
};
