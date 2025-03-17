import { Hono } from "hono";
import { productGetController } from "./product.controller.js";
import { productCollectionMiddleware } from "./product.middleware.js";

const product = new Hono();

product.get("/collections", productCollectionMiddleware, productGetController);

export default product;
