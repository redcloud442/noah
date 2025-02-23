import { Hono } from "hono";
import { protectionMiddleware } from "../../middleware/protection.middleware.js";
import {
  authLoginController,
  authLogoutController,
  authRegisterController,
  authVerifyTokenController,
  createCheckoutTokenController,
  verifyCheckoutTokenController,
} from "./auth.controller.js";
import {
  authLoginMiddleware,
  authRegisterMiddleware,
  createCheckoutTokenMiddleware,
  verifyCheckoutTokenMiddleware,
} from "./auth.middleware.js";

const auth = new Hono();

auth.post("/login", authLoginMiddleware, authLoginController);

auth.post(
  "/register",
  protectionMiddleware,
  authRegisterMiddleware,
  authRegisterController
);

auth.post("/logout", authLogoutController);

auth.get("/user", protectionMiddleware, authVerifyTokenController);

auth.post(
  "/checkout-token",
  createCheckoutTokenMiddleware,
  createCheckoutTokenController
);

auth.get(
  "/verify-checkout-token",
  verifyCheckoutTokenMiddleware,
  verifyCheckoutTokenController
);

export default auth;
