import { Providers } from "@/components/LayoutProviders/RootLayoutProvider";
import { jwtDecode } from "jwt-decode";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const user = cookieStore.get("auth_token");

  const decodedToken = jwtDecode(user?.value || "") as {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    role: string;
  };

  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers currentUser={decodedToken}>{children}</Providers>
      </body>
    </html>
  );
}
