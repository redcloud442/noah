import { authService } from "@/services/auth";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (data.user) {
      const cartState = searchParams.get("cart");
      const cart = cartState ? JSON.parse(cartState) : [];

      const nameParts = data.user?.user_metadata.full_name?.split(" ");
      const result = await authService.callback({
        email: data.user.email ?? "",
        firstName: nameParts?.[0] ?? "",
        lastName: nameParts?.[1] ?? "",
        userId: data.user.id ?? "",
        cart: cart,
      });

      return NextResponse.redirect(result.redirectTo);
    }

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
