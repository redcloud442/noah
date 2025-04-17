import { AppSidebar } from "@/components/LayoutProviders/AdminLayout/App-sidebar";
import SidebarSeparator from "@/components/LayoutProviders/AdminLayout/SidebarInset";
import { SidebarProvider } from "@/components/ui/sidebar";
import prisma from "@/utils/prisma/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ teamName: string }>;
}>) {
  const { teamName } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const teams = await prisma.team_member_table.findMany({
    where: {
      team_member_user_id: user.id,
    },
    select: {
      team_member_team: {
        select: {
          team_id: true,
          team_name: true,
          team_date_created: true,
        },
      },
    },
  });

  if (!teams) {
    return redirect("/500");
  }

  if (
    teams.some(
      (team: {
        team_member_team: {
          team_name: string;
        };
      }) => team.team_member_team.team_name === teamName
    )
  ) {
    return redirect("/500");
  }

  const activeTeam = teams.find(
    (team) => team.team_member_team.team_id === user.user_metadata.activeTeamId
  );

  if (!activeTeam) {
    return redirect("/500");
  }

  return (
    <SidebarProvider>
      <AppSidebar
        teams={teams.map((team) => team.team_member_team)}
        activeTeam={activeTeam.team_member_team}
      />
      <SidebarSeparator>{children}</SidebarSeparator>
    </SidebarProvider>
  );
}
