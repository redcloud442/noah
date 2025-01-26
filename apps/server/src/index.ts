import { serve } from "@hono/node-server";
import { Hono } from "hono";
import route from "./route/route.js";

const app = new Hono();

app.use("*", async (c, next) => {
  console.log("------ Incoming Request ------");
  console.log(`Method: ${c.req.method}`);
  console.log(`URL: ${c.req.url}`);

  // Parse query parameters (if present)
  const url = new URL(c.req.url);
  console.log(
    `Query Params: ${JSON.stringify(
      Object.fromEntries(url.searchParams),
      null,
      2
    )}`
  );

  // Parse body (if applicable)
  if (c.req.method !== "GET" && c.req.method !== "HEAD") {
    try {
      const body = await c.req.json();
      console.log(`Body: ${JSON.stringify(body, null, 2)}`);
    } catch (err) {
      console.log("Body: Unable to parse (not JSON)");
    }
  }
  console.log("-----------------------------");

  await next(); // Continue to the next handler
});

app.get("/", (c) => {
  return c.text("Api endpoint is working!");
});

app.route("/api/v1", route);

const port = 8080;

serve({
  fetch: app.fetch,
  port,
});
