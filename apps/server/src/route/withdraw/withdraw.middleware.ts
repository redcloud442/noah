import type { Context, Next } from "hono";
import { withdrawalSchema } from "../../schema/schema.js";
import { rateLimit } from "../../utils/redis.js";

export const withdrawMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  if (user.user_metadata.role !== "RESELLER") {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const isAllowed = await rateLimit(
    `rate-limit:${user.id}:user-withdraw`,
    5,
    "1m",
    c
  );

  if (!isAllowed) {
    return c.json({ message: "Too many requests" }, 429);
  }

  const params = await c.req.json();

  const { error } = withdrawalSchema.safeParse(params);

  if (error) {
    return c.json({ message: error.message }, 400);
  }

  c.set("params", params);

  await next();
};
