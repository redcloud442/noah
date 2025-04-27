import UserDetailsPage from "@/components/UserDetailsPage/UserDetailsPage";
import prisma from "@/utils/prisma/prisma";
import { protectionAdminMiddleware } from "@/utils/protectionMiddleware";
import { redirect } from "next/navigation";

const page = async ({
  params,
}: {
  params: Promise<{ userEmail: string; teamName: string }>;
}) => {
  const { userEmail, teamName } = await params;

  await protectionAdminMiddleware();

  const user = await prisma.user_table.findUnique({
    where: {
      user_email: decodeURIComponent(userEmail),
    },
    select: {
      user_id: true,
      user_first_name: true,
      user_last_name: true,
      user_email: true,
      team_member_table: {
        select: {
          team_member_id: true,
          team_member_date_created: true,
          team_member_role: true,
          team_member_active_team_id: true,
          team_member_team_id: true,
          team_member_team: {
            select: {
              team_name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect(`/${teamName}/admin/user`);
  }

  return <UserDetailsPage user={user} />;
};

export default page;
