import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateCheckoutNumber = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};
