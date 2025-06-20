import { isAdminRoute, isPrivateRoute, isPublicRoute } from "@/lib/utils";
import { createServerClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { CompanyMemberRole, RouteAction } from "../common";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const role = user?.user_metadata?.role as CompanyMemberRole | undefined;

  const action = determineRouteAction({
    user,
    role: role || null,
    pathname,
  });
  switch (action) {
    case RouteAction.ALLOW:
      supabaseResponse.headers.set("x-session-checked", "true");
      return addSecurityHeaders(supabaseResponse);

    case RouteAction.REDIRECT_LOGIN: {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    case RouteAction.REDIRECT_DASHBOARD: {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/account/orders";
      return addSecurityHeaders(NextResponse.redirect(homeUrl));
    }

    case RouteAction.REDIRECT_ADMIN: {
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = "/main/admin";
      return addSecurityHeaders(NextResponse.redirect(adminUrl));
    }

    case RouteAction.FORBIDDEN:
      return addSecurityHeaders(
        NextResponse.json({ error: "Forbidden" }, { status: 403 })
      );

    default:
      return addSecurityHeaders(NextResponse.next());
  }
}

type RouteActionParams = {
  user: User | null;
  role: CompanyMemberRole | null;
  pathname: string;
};

const determineRouteAction = ({
  user,
  role,
  pathname,
}: RouteActionParams): RouteAction => {
  if (pathname.startsWith("/api/v1")) {
    return RouteAction.ALLOW;
  }

  if (!user) {
    if (isPublicRoute(pathname)) return RouteAction.ALLOW;
    return RouteAction.REDIRECT_LOGIN;
  }

  // Handle admin-specific routes
  if (isAdminRoute(pathname)) {
    return role === CompanyMemberRole.ADMIN
      ? RouteAction.ALLOW
      : RouteAction.FORBIDDEN;
  }

  // Redirect admins away from regular user routes
  if (pathname.startsWith("/account") && role === CompanyMemberRole.ADMIN) {
    return RouteAction.REDIRECT_ADMIN;
  }

  // Handle private routes (non-admin)
  if (isPrivateRoute(pathname)) {
    return role !== CompanyMemberRole.ADMIN
      ? RouteAction.ALLOW
      : RouteAction.FORBIDDEN;
  }

  // Handle public routes for authenticated users
  if (isPublicRoute(pathname)) {
    if (pathname === "/login") return RouteAction.REDIRECT_DASHBOARD;
    return RouteAction.ALLOW;
  }

  // Default allow if none of the above conditions match
  return RouteAction.ALLOW;
};

const addSecurityHeaders = (response: NextResponse) => {
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  return response;
};
