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
  title: "Noir Clothing - Premium Fashion & Lifestyle Brand",
  description:
    "Discover Noir Clothing's exclusive collection of premium fashion, accessories, and lifestyle products. Shop high-end designer pieces with worldwide shipping and exceptional quality.",
  keywords:
    "noir clothing, premium fashion, luxury brand, designer clothing, high-end accessories, exclusive collections, luxury lifestyle",
  authors: [{ name: "Noir Clothing" }],
  creator: "Noir Clothing",
  publisher: "Noir Clothing",
  openGraph: {
    title: "Noir Clothing - Premium Fashion & Lifestyle Brand",
    description:
      "Discover exclusive luxury fashion and lifestyle collections at Noir Clothing. Premium quality, exceptional design.",
    url: "https://noir-clothing.com",
    siteName: "Noir Clothing",
    images: [
      {
        url: "https://noir-clothing.com/assets/logo/NOIR_Logo_White_png.png",
        width: 1200,
        height: 630,
        alt: "Noir Clothing - Premium Fashion Brand",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://noir-clothing.com",
  },
  category: "fashion",
  classification: "Luxury Fashion and Lifestyle",
  other: {
    "theme-color": "#000000",
  },
};

const handleFetchCollections = async () => {
  try {
    const data = await fetch(
      `${process.env.API_URL}/api/v1/publicRoutes/product-collections-all`,
      {
        method: "GET",
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
