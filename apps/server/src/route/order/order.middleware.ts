import { orderGetSchema } from "@packages/shared";
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { redis } from "../../utils/redis.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-strong-secret";

export const orderGetMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");
  const token = getCookie(c, "auth_token");

  if (!token) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const decoded = await verify(token, JWT_SECRET);

  if (!decoded) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const key = `order:${user.id}`;

  const isRateLimited = await redis.rateLimit(key, 100, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  if (decoded.role === "MEMBER") {
    c.set("user", decoded);
  } else {
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

  return next();
};

export const orderGetItemsMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");
  const token = getCookie(c, "auth_token");

  if (!token) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const decoded = await verify(token, JWT_SECRET);

  const key = `order:${user.id}-get-items`;

  const isRateLimited = await redis.rateLimit(key, 100, 60);

  if (!isRateLimited) {
    return c.json({ message: "Too many requests" }, 429);
  }

  if (!decoded) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  if (decoded.role === "MEMBER") {
    c.set("user", decoded);
  } else {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();

  c.set("params", { orderNumber: id });
  c.set("user", user);

  return next();
};
