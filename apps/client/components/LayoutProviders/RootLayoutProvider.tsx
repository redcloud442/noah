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

type RootLayoutProviderProps = {
  children: React.ReactNode;
  currentUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    role: string;
  };
};

export function Providers({ children, currentUser }: RootLayoutProviderProps) {
  const { user, setUser } = useUserStore();
  const queryClient = new QueryClient();
  const pathname = usePathname();

  useEffect(() => {
    const handleFetchUser = async () => {
      try {
        const data = await authService.verifyToken();

        setUser(data);
      } catch (error) {
        console.log(error);
      }
    };

    handleFetchUser();
  }, []);

  if (currentUser?.role === "ADMIN" && pathname.startsWith("/admin")) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <RoleProvider
            initialRole={user?.role ?? currentUser?.role ?? ""}
            initialFirstName={user?.firstName ?? currentUser?.firstName ?? ""}
            initialLastName={user?.lastName ?? currentUser?.lastName ?? ""}
            initialAvatar={user?.avatar ?? currentUser?.avatar ?? ""}
            initialEmail={user?.email ?? currentUser?.email ?? ""}
            initialId={user?.id ?? currentUser?.id ?? ""}
          >
            {children}
          </RoleProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  } else {
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
}
