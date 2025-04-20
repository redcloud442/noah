import { BreadcrumbUser } from "@/components/LayoutProviders/UserLayout/BreadcrumbUser";
import React from "react";

export default async function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen h-full bg-gray-100 mt-24 p-10 space-y-10">
      <BreadcrumbUser />
      {children}
    </div>
  );
}
