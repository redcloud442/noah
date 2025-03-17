import { productCollectionSchema } from "@packages/shared";
import type { Context, Next } from "hono";
import { adminAuthProtection } from "../../middleware/auth.middleware.js";

export const productCollectionMiddleware = async (c: Context, next: Next) => {
  await adminAuthProtection(c);

  const { search, take, skip } = c.req.query();

  const takeNumber = Number(take);
  const skipNumber = Number(skip);

  const validate = productCollectionSchema.safeParse({
    search,
    take: takeNumber,
    skip: skipNumber,
  });

  if (!validate.success) {
    return c.json({ message: "Invalid request" }, 400);
  }

  c.set("params", validate.data);

  await next();
};
