import prisma from "../../utils/prisma.js";

export const getUserModel = async (params: {
  userId: string;
  activeTeamId: string;
}) => {
  const userData = await prisma.user_table.findUnique({
    where: {
      user_id: params.userId,
    },
    select: {
      user_id: true,
      user_email: true,
      user_first_name: true,
      user_last_name: true,
    },
  });

  const teamMemberProfile = await prisma.team_member_table.findFirst({
    where: {
      team_member_user_id: params.userId,
      team_member_active_team_id: params.activeTeamId,
    },
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
  });

  const formattedTeamMemberProfile = {
    team_member_id: teamMemberProfile?.team_member_id,
    team_member_role: teamMemberProfile?.team_member_role,
    team_member_team_id: teamMemberProfile?.team_member_team_id,
    team_member_team: teamMemberProfile?.team_member_team.team_name,
    team_member_team_group: teamMemberProfile?.team_member_team_group.map(
      (teamGroup: {
        team_group_member_id: string;
        team_group_member_date_created: Date;
        team_group_member_team_member: {
          team_member_id: string;
          team_member_role: string;
          team_member_team_id: string;
        };
      }) => ({
        team_group_member_id: teamGroup.team_group_member_id,
        team_group_member_date_created:
          teamGroup.team_group_member_date_created,
        team_group_member_team_member: teamGroup.team_group_member_team_member,
      })
    ),
    team_member_date_created: teamMemberProfile?.team_member_date_created,
    team_member_active_team_id: params.activeTeamId,
  };

  const data = {
    userProfile: userData,
    teamMemberProfile: formattedTeamMemberProfile,
  };

  return data;
};
