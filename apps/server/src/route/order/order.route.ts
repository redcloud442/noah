import { Hono } from "hono";

import {
  orderGetController,
  orderGetItemsController,
  orderGetListController,
  orderUpdateController,
} from "./order.controller.js";
import {
  orderGetItemsMiddleware,
  orderGetListMiddleware,
  orderGetMiddleware,
  orderUpdateMiddleware,
} from "./order.middleware.js";

const order = new Hono();

order.get("/:id/items", orderGetItemsMiddleware, orderGetItemsController);

order.get("/", orderGetMiddleware, orderGetController);

order.post("/list", orderGetListMiddleware, orderGetListController);

order.put("/:id", orderUpdateMiddleware, orderUpdateController);

export default order;
