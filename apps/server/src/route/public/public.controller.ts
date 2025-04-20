import { Prisma } from "@prisma/client";
import type { Context } from "hono";
import { productPublicModel } from "./public.model.js";

export const productPublicController = async (c: Context) => {
  try {
    const params = c.get("params");

    const data = await productPublicModel(params);

    return c.json(data, 200);
  } catch (error) {
    console.log(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return c.json({ message: "Internal server error" }, 500);
    } else if (error instanceof Error) {
      return c.json({ message: "Internal server error" }, 500);
    }
  }
};
