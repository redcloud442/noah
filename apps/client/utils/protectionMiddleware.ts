import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const protectionAdminMiddleware = async () => {
  const cookieStore = await cookies();
  const user = cookieStore.get("auth_token");
  if (!user) {
    redirect("/login");
  }

  const UserData = jwtDecode(user?.value ?? "") as {
    id: string;
    role: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };

  if (UserData.role !== "ADMIN") {
    redirect("/");
  }

  return UserData;
};

export const protectionUserMiddleware = async () => {
  const cookieStore = await cookies();
  const user = cookieStore.get("auth_token");

  if (!user) {
    redirect("/login");
  }

  const UserData = jwtDecode(user?.value ?? "") as {
    id: string;
    role: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };

  if (UserData.role !== "MEMBER") {
    redirect("/");
  }

  return UserData;
};

export const supabaseMiddlewareHelper = async (supabaseUser: any) => {
  const cookieStore = await cookies();
  const user = cookieStore.get("auth_token");

  if (supabaseUser) {
    const UserData = jwtDecode(user?.value ?? "") as {
      id: string;
      role: string;
      email: string;
      firstName: string;
      lastName: string;
      avatar: string;
    };

    return UserData;
  } else {
    cookieStore.delete("auth_token");
  }

  return null;
};

export const checkoutTokenMiddleware = async () => {
  const cookieStore = await cookies();
  const user = cookieStore.get("auth_token");

  if (!user) {
    const checkoutToken = cookieStore.get("checkout_token");
    if (!checkoutToken) {
      return redirect("/");
    } else {
      return checkoutToken;
    }
  }

  return null;
};
