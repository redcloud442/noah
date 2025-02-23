import { Hono } from "hono";
import {
  checkoutProtectionMiddleware,
  protectionMiddleware,
} from "../middleware/protection.middleware.js";
import auth from "./auth/auth.route.js";
import cart from "./cart/cart.route.js";
import payment from "./payment/payment.route.js";
const app = new Hono();

app.route("/auth", auth);

// Cart
app.use("/cart/*", protectionMiddleware);
app.route("/cart", cart);

// Payment
app.use("/payment/*", checkoutProtectionMiddleware);
app.route("/payment", payment);

app.get("/", (c) => c.text("This is the api endpoint"));

export default app;
