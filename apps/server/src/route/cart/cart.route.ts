import { Hono } from "hono";
import { protectionMiddleware } from "../../middleware/protection.middleware.js";
import {
  cartDeleteController,
  cartGetController,
  cartGetQuantityController,
  cartPostController,
  cartPutController,
} from "./cart.controller.js";
import {
  cartDeleteMiddleware,
  cartGetQuantityMiddleware,
  cartMiddleware,
  cartPostMiddleware,
  cartPutMiddleware,
} from "./cart.middleware.js";

const cart = new Hono();

cart.get("/", protectionMiddleware, cartMiddleware, cartGetController);

cart.post("/quantity", cartGetQuantityMiddleware, cartGetQuantityController);

cart.post("/", protectionMiddleware, cartPostMiddleware, cartPostController);

cart.put("/:id", protectionMiddleware, cartPutMiddleware, cartPutController);

cart.delete(
  "/:id",
  protectionMiddleware,
  cartDeleteMiddleware,
  cartDeleteController
);

export default cart;
