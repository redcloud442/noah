import { Hono } from "hono";
import {
  resellerController,
  resellerDashboardController,
} from "./reseller.controller.js";
import {
  resellerDashboardMiddleware,
  resellerMiddleware,
} from "./reseller.middleware.js";
const reseller = new Hono();

reseller.get("/dashboard/transactions", resellerMiddleware, resellerController);

reseller.get(
  "/dashboard",
  resellerDashboardMiddleware,
  resellerDashboardController
);

export default reseller;
