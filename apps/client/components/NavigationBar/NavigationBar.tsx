"use client";

import Link from "next/link";
import * as React from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import useUserDataStore from "@/lib/userDataStore";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { FeaturedProductType, FreshDropsType } from "@/utils/types";
import { LogOut, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ShoppingCartModal from "../ShoppingCartModal/ShoppingCartModal";
import { Button } from "../ui/button";

type Collection = {
  product_category_id: string;
  product_category_name: string;
  product_category_image: string | null;
  product_category_description: string;
  product_category_slug: string;
};

export const NavigationBar = ({
  collections,
  freshDrops,
  featuredProducts,
}: {
  collections: Collection[];
  freshDrops: FreshDropsType[];
  featuredProducts: FeaturedProductType[];
}) => {
  const { userData, setUserData } = useUserDataStore();
  const supabase = createClient();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserData(null);
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error logging out");
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [hoveredItem, setHoveredItem] = useState({
    title: "Noir fashion",
    description:
      "Noir fashion is a fashion brand that sells fashionable and stylish clothes.",
    imageSrc: "/assets/model/noire-10278.jpg",
  });

  return (
    <>
      <div
        className={`hidden fixed top-0 left-0 right-0 z-50 md:flex justify-between items-center px-8 transition-all duration-500 ${
          isScrolled ? "bg-black" : "bg-transparent"
        }`}
      >
        <Link href="/" className="group">
          <div
            className={`relative overflow-hidden flex items-center justify-center transition-all duration-300 ${
              isScrolled ? "scale-90" : "scale-100"
            }`}
          >
            <Image
              src="/assets/logo/NOIR_Logo_White_png.png"
              alt="Noire Luxury"
              width={isScrolled ? 70 : 80}
              height={isScrolled ? 70 : 80}
              className="cursor-pointer transition-all duration-300 group-hover:scale-110"
            />
          </div>
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="space-x-2">
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={`${
                  isScrolled
                    ? "text-white hover:text-black"
                    : "text-white hover:text-gray-200"
                } bg-transparent font-medium text-base transition-all duration-300`}
              >
                Collections
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="p-6 w-[800px]">
                  <div className="grid grid-cols-[350px_1fr] gap-8">
                    {/* Featured Preview */}
                    <div className="group relative overflow-hidden rounded-2xl">
                      <div className="aspect-[3/4] relative">
                        <Image
                          src={hoveredItem.imageSrc}
                          alt={hoveredItem.title}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-6 left-6 text-white">
                          <h3 className="text-2xl font-bold mb-2 text-white">
                            {hoveredItem.title}
                          </h3>
                          <p className="text-sm opacity-90 line-clamp-2 text-white">
                            {hoveredItem.description}
                          </p>
                        </div>
                        <div className="absolute top-4 right-4">
                          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium">
                            Featured
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
                        Browse Collections
                      </h4>
                      <div className="grid gap-2">
                        {collections.map((collection) => (
                          <ListItem
                            key={collection.product_category_id}
                            title={collection.product_category_name}
                            description={
                              collection.product_category_description
                            }
                            imageSrc={collection.product_category_image || ""}
                            link={`/collections/${collection.product_category_slug.toLowerCase()}`}
                            setHoveredItem={setHoveredItem}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={`${
                  isScrolled
                    ? "text-white hover:text-black"
                    : "text-white hover:text-gray-200"
                } bg-transparent font-medium text-base transition-all duration-300`}
              >
                Featured Products
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="p-6 w-[1000px]">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">
                      Featured Products
                    </h4>
                    <p className="text-sm text-white">
                      Handpicked pieces from our latest collection
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-6">
                    {featuredProducts.map((component) => (
                      <ListItemWithImage
                        key={component.product_variant_id}
                        title={component.product_variant_color}
                        href={`/product/${component.product_variant_slug}`}
                        setHoveredItem={setHoveredItem}
                        description={
                          component.product_variant_product.product_description
                        }
                        imageSrc={
                          component.variant_sample_images[0]
                            .variant_sample_image_image_url
                        }
                      >
                        {component.product_variant_slug?.replace(/-/g, " ")}
                      </ListItemWithImage>
                    ))}
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={`${
                  isScrolled
                    ? "text-white hover:text-black"
                    : "text-white hover:text-gray-200"
                } bg-transparent font-medium text-base transition-all duration-300`}
              >
                Fresh Drops
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="p-6 w-[1000px]">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold mb-2">
                        Fresh Drops
                      </h4>
                      <p className="text-sm text-white">
                        Latest arrivals you can&apos;t miss
                      </p>
                    </div>
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                      New
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-6">
                    {freshDrops.map((component) => (
                      <ListItemWithImage
                        key={component.product_variant_id}
                        title={component.product_variant_color}
                        href={`/product/${component.product_variant_slug}`}
                        setHoveredItem={setHoveredItem}
                        description={
                          component.product_variant_product.product_description
                        }
                        imageSrc={
                          component.variant_sample_images[0]
                            .variant_sample_image_image_url
                        }
                      >
                        {component.product_variant_slug?.replace(/-/g, " ")}
                      </ListItemWithImage>
                    ))}
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center space-x-4">
          <div
            className={`${
              isScrolled ? "text-white" : "text-white"
            } transition-all duration-300`}
          >
            <ShoppingCartModal />
          </div>

          {userData?.teamMemberProfile?.team_member_role === "ADMIN" ? (
            <Link
              href={`/${userData?.teamMemberProfile?.team_member_team.toLowerCase()}/admin`}
              className={`${
                isScrolled
                  ? "text-white hover:text-black hover:bg-gray-100"
                  : "text-white hover:text-gray-200 hover:bg-white/10"
              } p-2 rounded-lg transition-all duration-300`}
            >
              <User className="w-5 h-5" />
            </Link>
          ) : userData?.teamMemberProfile?.team_member_role === "MEMBER" ||
            userData?.teamMemberProfile?.team_member_role === "RESELLER" ? (
            <div className="flex items-center space-x-2">
              <Link
                href="/account"
                className={`${
                  isScrolled
                    ? "text-white hover:text-black hover:bg-gray-100"
                    : "text-white hover:text-gray-200 hover:bg-white/10"
                } p-2 rounded-lg transition-all duration-300`}
              >
                <User className="w-5 h-5" />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className={`${
                  isScrolled
                    ? "text-white hover:text-black hover:bg-gray-100"
                    : "text-white hover:text-gray-200 hover:bg-white/10"
                } transition-all duration-300`}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Link
              href="/login"
              className={`${
                isScrolled
                  ? "text-white hover:text-black hover:bg-gray-100"
                  : "text-white hover:text-gray-200 hover:bg-white/10"
              } p-2 rounded-lg transition-all duration-300`}
            >
              <User className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

// Enhanced ListItem Component
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title: string;
    description: string;
    imageSrc: string;
    link?: string;
    setHoveredItem: React.Dispatch<
      React.SetStateAction<{
        title: string;
        description: string;
        imageSrc: string;
      }>
    >;
  }
>(
  (
    { className, title, description, imageSrc, setHoveredItem, link, ...props },
    ref
  ) => {
    return (
      <NavigationMenuLink asChild>
        <Link
          href={link || "#"}
          ref={ref}
          onMouseEnter={() => setHoveredItem({ title, description, imageSrc })}
          className={cn(
            "group block select-none rounded-xl p-4 leading-none no-underline outline-none transition-all duration-200 hover:bg-gray-500 hover:shadow-md border border-transparent hover:border-gray-200",
            className
          )}
          {...props}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-white group-hover:text-black transition-colors">
                {title.charAt(0).toUpperCase() + title.slice(1)}
              </div>
              <p className="text-sm text-gray-200 mt-1 line-clamp-2">
                {description}
              </p>
            </div>
            <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">→</span>
              </div>
            </div>
          </div>
        </Link>
      </NavigationMenuLink>
    );
  }
);
ListItem.displayName = "ListItem";

// Enhanced ListItemWithImage Component
const ListItemWithImage = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title: string;
    description: string;
    imageSrc: string;
    link?: string;
    setHoveredItem: React.Dispatch<
      React.SetStateAction<{
        title: string;
        description: string;
        imageSrc: string;
      }>
    >;
  }
>(
  (
    {
      className,
      title,
      description,
      imageSrc,
      setHoveredItem,
      children,
      link,
      ...props
    },
    ref
  ) => {
    return (
      <NavigationMenuLink asChild>
        <Link
          href={link || "#"}
          ref={ref}
          onMouseEnter={() => setHoveredItem({ title, description, imageSrc })}
          className={cn(
            "group block select-none space-y-3 rounded-xl p-3 leading-none no-underline outline-none transition-all duration-300 hover:shadow-lg hover:scale-105",
            className
          )}
          {...props}
        >
          <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
            <Image
              src={imageSrc}
              alt={title}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white uppercase tracking-wide">
              {children}
            </div>
            <p className="text-xs text-white mt-1 line-clamp-2">
              {description}
            </p>
          </div>
        </Link>
      </NavigationMenuLink>
    );
  }
);
ListItemWithImage.displayName = "ListItemWithImage";
