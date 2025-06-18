"use client";

import { Toaster as ToasterSonner } from "@/components/ui/sonner";
import useFeatureProductStore from "@/lib/featureProductStore";
import useCollectionProductStore from "@/lib/useCollectionProductStore";
import useUserDataStore from "@/lib/userDataStore";
import { authService } from "@/services/auth";
import { FeaturedProductType, FreshDropsType } from "@/utils/types";
import { User } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useParams } from "next/navigation";
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

const queryClient = new QueryClient();

function useInitStores({
  featuredProducts,
  collections,
}: {
  featuredProducts: FeaturedProductType[];
  collections: RootLayoutProviderProps["collections"];
}) {
  const { setFeaturedProducts } = useFeatureProductStore();
  const { setCollections } = useCollectionProductStore();

  useEffect(() => {
    setFeaturedProducts(featuredProducts);
    setCollections(collections);
  }, [featuredProducts, collections]);
}

function useFetchUser(user: User | null) {
  const { setUserData } = useUserDataStore();
  const { teamName } = useParams();

  useEffect(() => {
    if (!user) return;

    const fetchUser = async () => {
      try {
        const { userProfile, teamMemberProfile } = await authService.getUser();
        setUserData({ userProfile, teamMemberProfile });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error fetching user"
        );
      }
    };

    fetchUser();
  }, [user, teamName]);
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function ClientLayout({
  children,
  freshDrops,
  collections,
  featuredProducts,
}: {
  children: React.ReactNode;
  freshDrops: FreshDropsType[];
  collections: RootLayoutProviderProps["collections"];
  featuredProducts: FeaturedProductType[];
}) {
  return (
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
  );
}

export function Providers({
  children,
  user,
  collections,
  freshDrops,
  featuredProducts,
}: RootLayoutProviderProps) {
  const isAdmin = useMemo(() => user?.user_metadata.role === "ADMIN", [user]);

  useInitStores({ featuredProducts, collections });
  useFetchUser(user);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <div key={isAdmin ? "admin" : "public"}>
          {isAdmin ? (
            <AdminLayout>{children}</AdminLayout>
          ) : (
            <ClientLayout
              freshDrops={freshDrops}
              collections={collections}
              featuredProducts={featuredProducts}
            >
              {children}
            </ClientLayout>
          )}
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
