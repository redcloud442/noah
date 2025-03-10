import { Hono } from "hono";

import {
  orderGetController,
  orderGetItemsController,
} from "./order.controller.js";
import {
  orderGetItemsMiddleware,
  orderGetMiddleware,
} from "./order.middleware.js";

const order = new Hono();

order.get("/", orderGetMiddleware, orderGetController);

order.get("/:id/items", orderGetItemsMiddleware, orderGetItemsController);

export default order;
