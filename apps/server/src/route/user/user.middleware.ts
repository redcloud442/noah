import type { Context, Next } from "hono";
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
