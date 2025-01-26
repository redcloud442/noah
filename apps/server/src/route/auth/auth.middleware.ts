import type { Context, Next } from "hono";
import { registerSchema } from "../../schema/schema.js";

export const authMiddleware = async (c: Context, next: Next) => {
  const { email, password } = await c.req.json();

  const parsed = registerSchema.safeParse({ email, password });

  if (!parsed.success) {
    return c.json({ message: "Invalid email or password" }, 400);
  }

  console.log(parsed.data);

  await next();
};
