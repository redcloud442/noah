import { Hono } from "hono";
import {
  getUserController,
  getUserListController,
  userResellerRequestController,
  userVerifyResellerCodeController,
} from "./user.controller.js";
import {
  userGetMiddleware,
  userPostMiddleware,
  userResellerRequestMiddleware,
  userVerifyResellerCodeMiddleware,
} from "./user.middleware.js";

const user = new Hono();

user.get("/", userGetMiddleware, getUserController);

user.post("/", userPostMiddleware, getUserListController);

user.post(
  "/reseller-request",
  userResellerRequestMiddleware,
  userResellerRequestController
);

user.post(
  "/verify-reseller-code",
  userVerifyResellerCodeMiddleware,
  userVerifyResellerCodeController
);

export default user;
