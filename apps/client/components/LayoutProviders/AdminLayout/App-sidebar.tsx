"use client";

import {
  Banknote,
  BarChart,
  Box,
  LayoutDashboard,
  ListOrdered,
  PiggyBank,
  ShoppingBag,
  ShoppingCart,
  User,
  UserCheckIcon,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/LayoutProviders/AdminLayout/Navigation-main";
import { NavUser } from "@/components/LayoutProviders/AdminLayout/Navigation-user";
import { TeamSwitcher } from "@/components/LayoutProviders/AdminLayout/Team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import useUserDataStore from "@/lib/userDataStore";
import { authService } from "@/services/auth";
import { useEffect } from "react";
import { toast } from "sonner";

// This is sample data.

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  teams: { team_name: string; team_image: string }[];
  activeTeam: { team_name: string; team_image: string };
};

export function AppSidebar({ teams, activeTeam, ...props }: AppSidebarProps) {
  const activeTeamName = activeTeam.team_name.toLowerCase();
  const { userData, setUserData } = useUserDataStore();
  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: `/${activeTeamName}/admin`,
        icon: LayoutDashboard,
        isActive: true,
        items: [
          {
            title: "Analytics",
            url: `/${activeTeamName}/admin`,
            icon: BarChart,
          },
        ],
      },
      {
        title: "User Management",
        url: `/${activeTeamName}/admin`,
        icon: User,
        isActive: true,
        items: [
          {
            title: "User",
            url: `/${activeTeamName}/admin/user`,
            icon: ShoppingBag,
          },
          {
            title: "Reseller",
            url: `/${activeTeamName}/admin/user/reseller`,
            icon: UserCheckIcon,
          },
        ],
      },
      {
        title: "Products",
        url: `/${activeTeamName}/admin/product`,
        icon: ShoppingCart,
        isActive: true,
        items: [
          {
            title: "Collections",
            url: `/${activeTeamName}/admin/product/collections`,
            icon: ShoppingBag,
          },
          {
            title: "Products",
            url: `/${activeTeamName}/admin/product`,
            icon: Box,
          },
        ],
      },
      {
        title: "Orders",
        url: `/${activeTeamName}/admin/orders`,
        icon: ShoppingBag,
        isActive: true,
        items: [
          {
            title: "Orders",
            url: `/${activeTeamName}/admin/orders`,
            icon: ListOrdered,
          },
        ],
      },
      {
        title: "Withdrawal",
        url: `/${activeTeamName}/admin/withdrawal`,
        icon: PiggyBank,
        isActive: true,
        items: [
          {
            title: "Withdrawal",
            url: `/${activeTeamName}/admin/withdrawal`,
            icon: Banknote,
          },
        ],
      },
    ],
  };

  useEffect(() => {
    if (userData) return;

    const fetchUser = async () => {
      try {
        const { userProfile, teamMemberProfile } = await authService.getUser();
        setUserData({ userProfile, teamMemberProfile });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error fetching user"
        );
      }
    };

    fetchUser();
  }, [userData]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
