import { Providers } from "@/components/LayoutProviders/RootLayoutProvider";
import prisma from "@/utils/prisma/prisma";
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

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
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

  const freshDrops = await prisma.product_variant_table.findMany({
    where: {
      product_variant_is_deleted: false,
    },
    select: {
      product_variant_id: true,
      product_variant_color: true,
      product_variant_slug: true,
      product_variant_product: {
        select: {
          product_id: true,
          product_name: true,
          product_slug: true,
          product_description: true,
        },
      },
      variant_sample_images: {
        select: {
          variant_sample_image_id: true,
          variant_sample_image_image_url: true,
        },
        take: 1,
      },
    },
    orderBy: {
      product_variant_product: {
        product_created_at: "desc",
      },
    },
    take: 5,
  });

  const featuredProducts = await prisma.product_variant_table.findMany({
    where: {
      product_variant_is_deleted: false,
      product_variant_is_featured: true,
    },
    select: {
      product_variant_id: true,
      product_variant_color: true,
      product_variant_slug: true,
      product_variant_product: {
        select: {
          product_id: true,
          product_name: true,
          product_slug: true,
          product_description: true,
        },
      },
      variant_sample_images: {
        select: {
          variant_sample_image_id: true,
          variant_sample_image_image_url: true,
        },
        take: 1,
      },
    },
    orderBy: {
      product_variant_product: {
        product_created_at: "desc",
      },
    },
    take: 5,
  });

  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <Providers
          freshDrops={freshDrops}
          collections={collections}
          featuredProducts={featuredProducts}
          user={user}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
