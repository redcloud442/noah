import { CompanyMemberRole } from "@/utils/common";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateCheckoutNumber = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

export const getWithdrawalQueryKey = ({
  search,
  dateStart,
  dateEnd,
  status,
  activePage,
  sort,
  column,
  teamId,
}: {
  search: string;
  dateStart?: string;
  dateEnd?: string;
  status: string;
  activePage: number;
  sort: "asc" | "desc";
  column: string;
  teamId: string;
}) => [
  "withdrawals",
  { search, dateStart, dateEnd, status, activePage, sort, column, teamId },
];

export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/cart",
  "/checkout",
  "/collections",
  "/product",
  "/payment",
  "/shop",
  "/payment",
  "/api/v1/auth/register",
];

export const PRIVATE_ROUTES = ["/account"];

export const ADMIN_ROUTES = ["/main/admin"];

export const isPublicRoute = (pathname: string) => {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
};

export const isPrivateRoute = (pathname: string) => {
  return PRIVATE_ROUTES.some((route) => pathname.startsWith(route));
};

export const isAdminRoute = (pathname: string) => {
  return ADMIN_ROUTES.some((route) => pathname.startsWith(route));
};

export const ROUTE_ROLE_REQUIREMENTS: {
  path: string;
  role?: CompanyMemberRole;
}[] = [{ path: "/main/admin", role: CompanyMemberRole.ADMIN }];
