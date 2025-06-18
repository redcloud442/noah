"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useUserDataStore from "@/lib/userDataStore";
import { createClient } from "@/utils/supabase/client";
import { LogOut, Menu, ShoppingCart, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

type Collection = {
  product_category_id: string;
  product_category_name: string;
  product_category_slug: string;
};

export const MobileNavigationBar = ({
  collections,
}: {
  collections: Collection[];
}) => {
  const { userData, setUserData } = useUserDataStore();
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserData(null);
      router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error logging out");
      }
    }
  };
  return (
    <div
      className={`md:hidden fixed w-full top-0 z-50 text-white ${
        isScrolled ? "bg-black/60" : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/logo/NOIR_Logo_White_png.png"
            alt="Noir Logo"
            width={50}
            height={50}
          />
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-black text-white px-6 py-6 space-y-6">
            <SheetTitle className="text-white hidden"></SheetTitle>
            <SheetDescription className="text-white hidden"></SheetDescription>

            <div className="space-y-3">
              <p className="text-sm uppercase font-semibold text-gray-400">
                Collections
              </p>
              {collections.map((col) => (
                <Link
                  key={col.product_category_id}
                  href={`/collections/${col.product_category_slug}`}
                  className="block text-white hover:underline"
                  onClick={() => setOpen(false)}
                >
                  {col.product_category_name}
                </Link>
              ))}
            </div>

            <div className="space-y-2">
              <Link
                href="/featured"
                className="block text-white hover:underline"
                onClick={() => setOpen(false)}
              >
                Featured Products
              </Link>
              <Link
                href="/drops"
                className="block text-white hover:underline"
                onClick={() => setOpen(false)}
              >
                Fresh Drops
              </Link>
            </div>

            <div className="border-t border-white/20 pt-4 space-y-3">
              <Link href="/cart" className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Cart</span>
              </Link>

              {userData ? (
                <>
                  <Link
                    href={
                      userData.teamMemberProfile?.team_member_role === "ADMIN"
                        ? `/${userData.teamMemberProfile?.team_member_team.toLowerCase()}/admin`
                        : "/account"
                    }
                    className="flex items-center gap-2"
                    onClick={() => setOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    {userData.userProfile.user_first_name}
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-0"
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2"
                  onClick={() => setOpen(false)}
                >
                  <User className="w-5 h-5" />
                  Login
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
