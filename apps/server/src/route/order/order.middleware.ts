import { orderGetSchema } from "@packages/shared";
import type { Context, Next } from "hono";
import { redis } from "../../utils/redis.js";

export const orderGetMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const key = `order:${user.id}`;

  const isRateLimited = await redis.rateLimit(key, 100, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
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

export const orderGetItemsMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const key = `order:${user.id}-get-items`;

  const isRateLimited = await redis.rateLimit(key, 100, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  const { id } = c.req.param();

  c.set("params", { orderNumber: id });
  c.set("user", user);

  await next();
};
