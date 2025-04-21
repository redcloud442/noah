"use client";

import { Toaster as ToasterSonner } from "@/components/ui/sonner";
import useFeatureProductStore from "@/lib/featureProductStore";
import useUserDataStore from "@/lib/userDataStore";
import { authService } from "@/services/auth";
import { FeaturedProductType, FreshDropsType } from "@/utils/types";
import { User } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Footer } from "../Footer/Footer";
import { NavigationBar } from "../NavigationBar/NavigationBar";
import { MobileNavigationBar } from "../NavigationBar/NavigationBarSmallScreen";
import { Toaster } from "../ui/toaster";
type RootLayoutProviderProps = {
  children: React.ReactNode;
  user: User | null;
  freshDrops: FreshDropsType[];
  featuredProducts: FeaturedProductType[];
  collections: {
    product_category_id: string;
    product_category_name: string;
    product_category_image: string | null;
    product_category_slug: string;
    product_category_description: string;
  }[];
};

export function Providers({
  children,
  user,
  collections,
  freshDrops,
  featuredProducts,
}: RootLayoutProviderProps) {
  const queryClient = new QueryClient();
  const pathname = usePathname();
  const isInAdminPath = pathname.includes("admin");

  const { teamName } = useParams();
  const { setUserData } = useUserDataStore();
  const { setFeaturedProducts } = useFeatureProductStore();

  useEffect(() => {
    setFeaturedProducts(featuredProducts);
  }, [featuredProducts]);

  const fetchUser = async () => {
    try {
      if (user) {
        const { userProfile, teamMemberProfile } = await authService.getUser();

        setUserData({ userProfile, teamMemberProfile });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error fetching user");
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, [user, teamName]);

  const isAdmin = useMemo(() => {
    return user?.user_metadata.role === "ADMIN";
  }, [user]);

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
            <NavigationBar
              freshDrops={freshDrops}
              collections={collections}
              featuredProducts={featuredProducts}
            />
            <MobileNavigationBar collections={collections} />
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
