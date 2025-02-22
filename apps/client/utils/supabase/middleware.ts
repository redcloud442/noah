import { createServerClient } from "@supabase/ssr";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

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

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookie = (await cookies()).get("auth_token");

  // 🔹 Only block access to `/account`, allow `/`
  if (request.nextUrl.pathname === "/account") {
    // 🔹 Redirect to `/` if neither a user nor a valid cookie exists
    if (!cookie && !user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 🔹 Decode the token if available
    const decoded = jwtDecode<{ role?: string }>(
      cookie?.value ?? user?.user_metadata?.token
    );

    // 🔹 Allow access only if the role is "MEMBER"
    if (decoded.role === "MEMBER") {
      return NextResponse.next();
    }

    // 🔹 Redirect unauthorized users
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return supabaseResponse;
}
