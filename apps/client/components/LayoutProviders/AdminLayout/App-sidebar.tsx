"use client";

import {
  BarChart,
  Box,
  LayoutDashboard,
  ListOrdered,
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
import { team_table } from "@prisma/client";

// This is sample data.

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  teams: team_table[];
  activeTeam: team_table;
};

export function AppSidebar({ teams, activeTeam, ...props }: AppSidebarProps) {
  const activeTeamName = activeTeam.team_name.toLowerCase();
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
            url: `/${activeTeamName}/admin/reseller`,
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
    ],
  };

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
