import { Hono } from "hono";
import { withdrawController } from "./withdraw.controller.js";
import { withdrawMiddleware } from "./withdraw.middleware.js";

const withdraw = new Hono();

withdraw.post("/", withdrawMiddleware, withdrawController);

export default withdraw;
