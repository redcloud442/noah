import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { Context, MiddlewareHandler } from "hono";
import { env } from "hono/adapter";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";

export const getSupabase = (c: Context) => {
  return c.get("supabase");
};

type SupabaseEnv = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

export const supabaseMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const supabaseEnv = env<SupabaseEnv>(c);
    const supabaseUrl = supabaseEnv.SUPABASE_URL;
    const supabaseAnonKey = supabaseEnv.SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL missing!");
    }

    if (!supabaseAnonKey) {
      throw new Error("SUPABASE_ANON_KEY missing!");
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return parseCookieHeader(c.req.header("Cookie") ?? "");
        },
      },
    });

    c.set("supabase", supabase);

    await next();
  };
};

const JWT_SECRET = process.env.JWT_SECRET || "your-strong-secret";

export const adminAuthProtection = async (c: Context) => {
  const token = getCookie(c, "auth_token");

  if (!token) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const decoded = await verify(token, JWT_SECRET);

  if (decoded.role !== "ADMIN") {
    return c.json({ message: "Unauthorized" }, 401);
  }

  c.set("user", decoded);
};
