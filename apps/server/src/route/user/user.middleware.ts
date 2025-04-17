import type { Context, Next } from "hono";
import { userPostSchema } from "../../schema/schema.js";
import { redis } from "../../utils/redis.js";

export const userGetMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const key = `user:${user.id}`;

  const isRateLimited = await redis.rateLimit(key, 10, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  await next();
};

export const userPostMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const key = `user:${user.id}`;

  const isRateLimited = await redis.rateLimit(key, 10, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  const { params } = await c.req.json();

  console.log(params);

  const { error } = userPostSchema.safeParse(params);

  if (error) {
    return c.json({ message: error.message }, 400);
  }

  c.set("params", params);

  await next();
};
