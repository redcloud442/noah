import { Providers } from "@/components/LayoutProviders/RootLayoutProvider";
import prisma from "@/utils/prisma/prisma";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import React from "react";
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
  title: "Noire Luxury",
  description: "Noire Luxury",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const collections = await prisma.product_category_table.findMany({
    select: {
      product_category_id: true,
      product_category_name: true,
      product_category_description: true,
      product_category_image: true,
      product_category_slug: true,
    },
  });

  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <Providers collections={collections} user={user}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
