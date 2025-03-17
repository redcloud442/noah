"use client";

import { useRouter } from "next/navigation";
import { Button } from "./button";

type Props = {
  variant:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "link"
    | "ghost"
    | null
    | undefined;
  type: "link" | "normal";
  href?: string;
  children: React.ReactNode;
};

const ButtonVariant = ({ variant, href, children, type }: Props) => {
  const router = useRouter();

  const handleClick = () => {
    if (type === "link" && href) {
      router.push(href);
    }
  };

  return (
    <Button variant={variant} onClick={handleClick}>
      {children}
    </Button>
  );
};

export default ButtonVariant;
