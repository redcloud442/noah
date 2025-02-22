import { hc } from "hono/client";
import { AppType } from "../rpc";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

export const client = hc<AppType>(BASE_URL + "/api/v1", {
  headers: () => ({
    "Content-Type": "application/json",
    Accept: "application/json",
    cookie: document.cookie,
  }),
}) as unknown as AppType;
