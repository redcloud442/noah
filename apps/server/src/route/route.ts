import { Hono } from "hono";
import {
  checkoutProtectionMiddleware,
  protectionMiddleware,
} from "../middleware/protection.middleware.js";
import address from "./address/address.route.js";
import auth from "./auth/auth.route.js";
import cart from "./cart/cart.route.js";
import order from "./order/order.route.js";
import payment from "./payment/payment.route.js";
import product from "./product/product.route.js";

const app = new Hono();

app.route("/auth", auth);

// Cart
app.use("/cart/*", protectionMiddleware);
app.route("/cart", cart);

// Payment
app.use("/payment/*", checkoutProtectionMiddleware);
app.route("/payment", payment);

// Orders
app.use("/orders/*", protectionMiddleware);
app.route("/orders", order);

// Address
app.use("/address/*", protectionMiddleware);
app.route("/address", address);

// Product
app.use("/product/*", protectionMiddleware);
app.route("/product", product);

app.get("/", (c) => c.text("This is the api endpoint"));

export default app;
