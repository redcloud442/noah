"use client";

import { Toaster as ToasterSonner } from "@/components/ui/sonner";
import useUserStore from "@/lib/userStore";
import { authService } from "@/services/auth";
import { RoleProvider } from "@/utils/context/context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Footer } from "../Footer/Footer";
import { NavigationBar } from "../NavigationBar/NavigationBar";
import { Toaster } from "../ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useUserStore();
  const queryClient = new QueryClient();

  const pathname = usePathname();

  useEffect(() => {
    const handleFetchUser = async () => {
      try {
        if (!user) {
          const data = await authService.verifyToken();
          setUser(data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    handleFetchUser();
  }, [user]);

  if (pathname.startsWith("/admin")) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider
        initialRole={user?.role ?? ""}
        initialFirstName={user?.firstName ?? ""}
        initialLastName={user?.lastName ?? ""}
        initialAvatar={user?.avatar ?? ""}
        initialEmail={user?.email ?? ""}
        initialId={user?.id ?? ""}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NavigationBar />
          <main>{children}</main>
          <Footer />
          <Toaster />
          <ToasterSonner />
        </ThemeProvider>
      </RoleProvider>
    </QueryClientProvider>
  );
}
