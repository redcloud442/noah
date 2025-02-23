import type { Context } from "hono";
import { createPaymentIntent } from "./payment.model.js";

export const paymentPostController = async (c: Context) => {
  try {
    const params = c.get("params");
    const user = c.get("user");

    const paymentIntent = await createPaymentIntent(params, user);

    return c.json(paymentIntent, 200);
  } catch (error) {
    return c.json({ message: "Internal Server Error" }, 500);
  }
};
