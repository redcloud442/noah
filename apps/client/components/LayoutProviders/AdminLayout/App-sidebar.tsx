"use client";

import {
  Frame,
  LayoutDashboard,
  Map,
  PieChart,
  Settings2,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/LayoutProviders/AdminLayout/Navigation-main";
import { NavProjects } from "@/components/LayoutProviders/AdminLayout/Navigation-projects";
import { NavUser } from "@/components/LayoutProviders/AdminLayout/Navigation-user";
import { TeamSwitcher } from "@/components/LayoutProviders/AdminLayout/Team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/assets/logo/NOIR_Logo_White_png.png",
  },
  teams: [
    {
      name: "NOIR Clothing",
      logo: "/assets/logo/NOIR_Logo_White_png.png",
      plan: "Admin Panel",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Home",
          url: "/admin",
        },
        {
          title: "Sales",
          url: "/admin/sales",
        },
        {
          title: "Users",
          url: "/admin/users",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: ShoppingCart,
      items: [
        {
          title: "Collections",
          url: "/admin/collections",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: ShoppingBag,
      items: [
        {
          title: "Orders",
          url: "/admin/orders",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
