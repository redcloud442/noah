import { BreadcrumbUser } from "@/components/LayoutProviders/UserLayout/BreadcrumbUser";
import React from "react";

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className=" h-[100vh] bg-gray-100 mt-24 p-10 space-y-10">
        <BreadcrumbUser />
        {children}
      </div>
    </>
  );
}
