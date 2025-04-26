"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChangePasswordTab from "./ChangePasswordTab/ChangePasswordTab";
import GenerateLoginLinkTab from "./GenerateLoginLinkTab/GenerateLoginLinkTab";
import UserOrderHistoryTable from "./UserOrderHistoryTab/UserOrderHistoryTable";

type Props = {
  user: {
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_email: string;
    team_member_table: {
      team_member_id: string;
      team_member_date_created: Date;
      team_member_role: string;
      team_member_active_team_id: string;
      team_member_team_id: string;
      team_member_team: {
        team_name: string;
      };
    }[];
  };
};

const UserDetailsPage = ({ user }: Props) => {
  return (
    <div className=" mx-auto py-10 px-4 space-y-10">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {user.user_first_name} {user.user_last_name}
          </CardTitle>
          <CardDescription>{user.user_email}</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="change-password">Change Password</TabsTrigger>
              <TabsTrigger value="signin-link">
                Generate Sign-In Link
              </TabsTrigger>
            </TabsList>

            {/* Tabs Content */}
            <TabsContent value="profile">
              <Separator className="my-4" />
              <h2 className="text-xl font-semibold mb-4">Team Memberships</h2>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Team Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Active Team</TableHead>
                        <TableHead>Date Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.team_member_table.map((team) => (
                        <TableRow key={team.team_member_id}>
                          <TableCell>
                            {team.team_member_team.team_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {team.team_member_role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {team.team_member_active_team_id ===
                            team.team_member_team_id ? (
                              <Badge variant="outline">Active</Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              team.team_member_date_created
                            ).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Separator className="my-4" />
              <UserOrderHistoryTable userId={user.user_id} />
            </TabsContent>

            <TabsContent value="change-password">
              <Separator className="my-4" />
              <ChangePasswordTab userId={user.user_id} />
            </TabsContent>

            <TabsContent value="signin-link">
              <Separator className="my-4" />
              <GenerateLoginLinkTab email={user.user_email} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetailsPage;
