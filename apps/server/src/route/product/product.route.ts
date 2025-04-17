import { Hono } from "hono";
import {
  productCollectionSlugController,
  productCreateController,
  productGetAllProductController,
  productGetController,
  productVariantCreateController,
  productVariantUpdateController,
} from "./product.controller.js";
import {
  productCollectionMiddleware,
  productCollectionSlugMiddleware,
  productCollectionsPostMiddleware,
  productCreateMiddleware,
  productGetAllProductMiddleware,
  productUpdateMiddleware,
} from "./product.middleware.js";

const product = new Hono();

product.get("/collections", productCollectionMiddleware, productGetController);

product.post(
  "/collections",
  productCollectionsPostMiddleware,
  productCreateController
);

product.post("/", productCreateMiddleware, productVariantCreateController);

product.put("/", productUpdateMiddleware, productVariantUpdateController);

product.post(
  "/all-product",
  productGetAllProductMiddleware,
  productGetAllProductController
);

product.post(
  "/collections/:collectionSlug",
  productCollectionSlugMiddleware,
  productCollectionSlugController
);

export default product;
