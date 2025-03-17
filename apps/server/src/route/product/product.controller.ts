import { Prisma } from "@prisma/client";
import type { Context } from "hono";
import { productCollectionModel } from "./product.model.js";
export const productGetController = async (c: Context) => {
  try {
    const params = c.get("params");

    const products = await productCollectionModel(params);
    return c.json(products, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return c.json(
        {
          message: "Internal server error",
          error: "Internal server error",
        },
        500
      );
    } else if (error instanceof Error) {
      return c.json(
        {
          message: "Internal server error",
          error: error.message,
        },
        500
      );
    }
  }
};
