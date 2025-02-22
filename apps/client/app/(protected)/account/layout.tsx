"use client";
import useUserStore from "@/lib/userStore";
import { authService } from "@/services/auth";
import React, { useEffect } from "react";

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setUser } = useUserStore();

  useEffect(() => {
    const handleFetchUser = async () => {
      const data = await authService.verifyToken();

      if (data.error) {
        console.error(data.error);
      }

      setUser(data);
    };

    handleFetchUser();
  }, []);

  return <div className=" h-[100vh] bg-gray-100 mt-24">{children}</div>;
}
