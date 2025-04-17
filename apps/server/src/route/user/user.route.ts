import { Hono } from "hono";
import { getUserController, getUserListController } from "./user.controller.js";
import { userGetMiddleware, userPostMiddleware } from "./user.middleware.js";

const user = new Hono();

user.get("/", userGetMiddleware, getUserController);

user.post("/", userPostMiddleware, getUserListController);

export default user;
