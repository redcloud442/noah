import { team_group_member_table } from "@prisma/client";

export type teamMemberProfile = {
  team_member_date_created: Date;
  team_member_team_id: string;
  team_member_user_id: string;
  team_member_team: string;
  team_member_role: string;
  team_member_team_group: team_group_member_table[];
};
