import { Hono } from "hono";
import { getUserController } from "./user.controller.js";
import { userGetMiddleware } from "./user.middleware.js";

const user = new Hono();

user.get("/", userGetMiddleware, getUserController);

export default user;
