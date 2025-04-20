import { Hono } from "hono";
import { productPublicController } from "./public.controller.js";
import { productPublicMiddleware } from "./public.middleware.js";

const publicRoutes = new Hono();

publicRoutes.get(
  "/product-public",
  productPublicMiddleware,
  productPublicController
);

export default publicRoutes;
