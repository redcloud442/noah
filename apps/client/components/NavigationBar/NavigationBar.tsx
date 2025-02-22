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
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import useUserStore from "@/lib/userStore";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth";
import { User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import ShoppingCartModal from "../ShoppingCartModal/ShoppingCartModal";

const components: {
  imageSrc: string;
  title: string;
  href: string;
  description: string;
}[] = [
  {
    imageSrc: "/assets/model/noire-10278.jpg",
    title: "Noire fashion",
    href: "/collections/noire-fashion",
    description:
      "Noire fashion is a fashion brand that sells fashionable and stylish clothes.",
  },
];

export const NavigationBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  const { user, setUser } = useUserStore();

  useEffect(() => {
    const handleFetchUser = async () => {
      if (!user.id) return;
      const data = await authService.verifyToken();

      setUser(data);
    };

    handleFetchUser();
  }, [user.id]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [hoveredItem, setHoveredItem] = useState({
    title: "Noire fashion",
    description:
      "Noire fashion is a fashion brand that sells fashionable and stylish clothes.",
    imageSrc: "/assets/model/noire-10278.jpg",
  });

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex justify-evenly items-center transition-all duration-300 ${
        isScrolled ? "bg-black/60" : "bg-transparent"
      }`}
    >
      <Link href="/">
        <div className="relative overflow-hidden flex items-center justify-center">
          <Image
            src="/assets/logo/NOIR_Logo_White_png.png"
            alt="Noire Luxury"
            width={80}
            height={80}
            className="cursor-pointer relative"
          />
        </div>
      </Link>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Collections</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-2 p-4 md:w-[400px] lg:w-[700px] lg:grid-cols-[.75fr_1fr]">
                {/* Main item with hover effect */}
                <li className="row-span-3 group relative">
                  <Link
                    href="/"
                    className="flex h-full w-full select-none flex-col justify-end rounded-md p-6 no-underline outline-none focus:shadow-md"
                  >
                    <div className="relative w-full h-full bg-gray-200 rounded-md overflow-hidden">
                      <Image
                        src={hoveredItem.imageSrc}
                        alt={hoveredItem.title}
                        width={150}
                        height={150}
                        quality={100}
                        className="w-full h-full object-cover transition-opacity duration-500"
                      />

                      <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                        <h2 className="text-lg font-medium">
                          {hoveredItem.title}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {hoveredItem.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>

                {/* Other items */}
                <div className="flex flex-col gap-2">
                  <ListItem
                    title="Tee"
                    description="Tee that is comfortable and stylish."
                    imageSrc="/assets/model/noire-10278.jpg"
                    link="/collections/tee"
                    setHoveredItem={setHoveredItem}
                  >
                    Tee that is comfortable and stylish
                  </ListItem>

                  <ListItem
                    title="Pants"
                    description="Pants that are comfortable and stylish."
                    imageSrc="/assets/model/noire-10243.jpg"
                    link="/collections/pants"
                    setHoveredItem={setHoveredItem}
                  >
                    Pants that are comfortable and stylish
                  </ListItem>

                  <ListItem
                    title="Hoodies"
                    description="Hoodies that are comfortable and stylish."
                    imageSrc="/assets/model/QR_59794.jpg"
                    link="/collections/hoodies"
                    setHoveredItem={setHoveredItem}
                  >
                    Hoodies that are comfortable and stylish
                  </ListItem>
                </div>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Featured Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                    setHoveredItem={setHoveredItem}
                    description={component.description}
                    imageSrc={component.imageSrc as string}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Featured Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                    setHoveredItem={setHoveredItem}
                    description={component.description}
                    imageSrc={component.imageSrc as string}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <ShoppingCartModal />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/login" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <User className="w-5 h-5" />
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

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
      <li>
        <NavigationMenuLink asChild>
          <Link
            href={link || "#"}
            ref={ref}
            onMouseEnter={() =>
              setHoveredItem({ title, description, imageSrc })
            }
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </Link>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = "ListItem";
