"use client";

import { authService } from "@/services/auth";
import useUserDataStore from "@/utils/store/userDataStore";
import { createClient } from "@/utils/supabase/client";
import {
  AppShell,
  Burger,
  Divider,
  Group,
  LoadingOverlay,
  Text,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavBar from "./NavBar";

type Props = {
  user: User | null;
  children: React.ReactNode;
};

const PublicLayout = ({ user, children }: Props) => {
  const [opened, { toggle }] = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const { clearUserData } = useUserDataStore();
  const { setUserData, userData } = useUserDataStore();

  const isMobile = useMediaQuery("(max-width: 768px)");

  const fetchUser = async () => {
    try {
      if (user) {
        setIsLoading(true);
        const { userProfile, teamMemberProfile, resellerProfile } =
          await authService.getUser();

        setUserData({ userProfile, teamMemberProfile, resellerProfile });
      }
    } catch (error) {
      if (error instanceof Error) {
        notifications.show({
          title: "Error",
          message: error.message,
          color: "red",
        });
      } else {
        notifications.show({
          title: "Error",
          message: "Error fetching user",
          color: "red",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [user]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      router.push("/auth/sign-in");
      clearUserData();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Error logging out",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navBar = userData ? { width: 300, breakpoint: "sm" } : undefined;

  return (
    <AppShell navbar={navBar} header={{ height: 60 }} padding="md">
      <LoadingOverlay visible={isLoading} />
      <AppShell.Header>
        <Group justify="space-between" align="center" h="100%" px="md">
          <Group align="center" gap="sm">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Link href={`${user ? "/dashboard" : "/"}`}>
              <Image
                src="/logo/NOIR_Logo_White_png.png"
                alt="Noir Reseller"
                width={50}
                height={50}
              />
            </Link>

            {!isMobile && (
              <>
                <Divider orientation="vertical" />

                <Text fw={700} size="lg">
                  Noir Reseller
                </Text>
              </>
            )}
          </Group>

          <Group>
            {userData && (
              <Text fw={700} size="lg">
                Balance: ₱{" "}
                {userData?.resellerProfile.reseller_withdrawable_earnings.toLocaleString() ??
                  0}
              </Text>
            )}
          </Group>
        </Group>
      </AppShell.Header>
      {userData && (
        <NavBar onLogout={handleLogout} opened={opened} onClose={toggle} />
      )}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default PublicLayout;
