import { BreadcrumbUser } from "@/components/LayoutProviders/UserLayout/BreadcrumbUser";
import { protectionUserMiddleware } from "@/utils/protectionMiddleware";
import { redirect } from "next/navigation";
import React from "react";

export default async function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await protectionUserMiddleware();
  if (!user) {
    return redirect("/");
  }

  return (
    <div className="min-h-screen h-full bg-gray-100 mt-24 p-4 sm:p-10 space-y-10">
      <BreadcrumbUser />

      {children}
    </div>
  );
}
