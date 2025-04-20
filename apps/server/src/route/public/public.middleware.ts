import type { Context, Next } from "hono";
import { rateLimit } from "../../utils/redis.js";
import { productPublicSchema } from "../../utils/schema.js";

export const productPublicMiddleware = async (c: Context, next: Next) => {
  const ip = c.req.header("x-forwarded-for");

  const isAllowed = await rateLimit(
    `rate-limit:${ip}:product-public`,
    20,
    "1m",
    c
  );

  if (!isAllowed) {
    return c.json({ message: "Too many requests" }, 429);
  }

  const { take, skip, search, category, sort } = c.req.query();

  const validate = productPublicSchema.safeParse({
    take,
    skip,
    search,
    category,
    sort,
  });

  if (!validate.success) {
    return c.json({ message: "Invalid request" }, 400);
  }

  c.set("params", validate.data);

  return await next();
};
