"use client";

import { Toaster as ToasterSonner } from "@/components/ui/sonner";
import useUserDataStore from "@/lib/userDataStore";
import { authService } from "@/services/auth";
import { User } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Footer } from "../Footer/Footer";
import { NavigationBar } from "../NavigationBar/NavigationBar";
import { Toaster } from "../ui/toaster";
type RootLayoutProviderProps = {
  children: React.ReactNode;
  user: User | null;
};

export function Providers({ children, user }: RootLayoutProviderProps) {
  const queryClient = new QueryClient();
  const pathname = usePathname();
  const isInAdminPath = pathname.includes("admin");
  const { setUserData } = useUserDataStore();

  const fetchUser = async () => {
    try {
      if (user) {
        const { userProfile, teamMemberProfile } = await authService.getUser();

        setUserData({ userProfile, teamMemberProfile });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [user]);

  const isAdmin = user?.user_metadata.role === "ADMIN";

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {isAdmin && isInAdminPath ? (
          children
        ) : (
          <>
            <NavigationBar />
            <main>{children}</main>
            <Footer />
            <Toaster />
            <ToasterSonner />
          </>
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
