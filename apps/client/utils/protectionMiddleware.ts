import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "./prisma/prisma";
import { createClient } from "./supabase/server";

export const protectionAdminMiddleware = async () => {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) return redirect("/login");

  if (currentUser.user_metadata.role !== "ADMIN") {
    return redirect("/500");
  }

  return currentUser;
};

export const protectionUserMiddleware = async () => {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) return redirect("/login");

  if (currentUser.user_metadata.role === "MEMBER") {
    return redirect("/");
  }

  return currentUser;
};

export const supabaseMiddlewareHelper = async () => {
  const cookieStore = await cookies();
  const user = cookieStore.get("auth_token");

  if (user) {
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

export const getUserDataLayout = async () => {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) return null;

  const userData = await prisma.user_table.findUnique({
    where: {
      user_id: currentUser.id,
    },
    select: {
      user_id: true,
      user_email: true,
      user_first_name: true,
      user_last_name: true,
      team_member_table: {
        select: {
          team_member_id: true,
          team_member_role: true,
          team_member_team_id: true,
          team_member_date_created: true,

          team_member_team: {
            select: {
              team_id: true,
              team_name: true,
              team_date_created: true,
            },
          },

          team_member_team_group: {
            select: {
              team_group_member_id: true,
              team_group_member_date_created: true,
              team_group_member_team_member: {
                select: {
                  team_member_id: true,
                  team_member_role: true,
                  team_member_team_id: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return userData;
};
