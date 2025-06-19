import { Providers } from "@/components/LayoutProviders/RootLayoutProvider";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Noir Luxury",
  description: "Noir Luxury",
};

const handleFetchCollections = async () => {
  try {
    const data = await fetch(
      `${process.env.API_URL}/api/v1/publicRoutes/product-collections-all`,
      {
        method: "GET",
        // next: {
        //   revalidate: 60 * 10,
        // },
      }
    );

    const response = await data.json();

    const { freshDrops, featuredProducts, collections } = response;

    return { freshDrops, featuredProducts, collections };
  } catch (error) {
    console.error("Error fetching collections:", error);
    return { freshDrops: [], featuredProducts: [], collections: [] };
  }
};

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const supabase = await createClient();

  const [{ data: userData }, collectionData] = await Promise.all([
    supabase.auth.getUser(),
    handleFetchCollections(),
  ]);

  const { freshDrops, featuredProducts, collections } = collectionData;

  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <Providers
          freshDrops={freshDrops}
          collections={collections}
          featuredProducts={featuredProducts}
          user={userData.user}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
