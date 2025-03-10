"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

export function BreadcrumbUser() {
  const pathname = usePathname(); // Get current path
  const pathSegments = pathname.split("/").filter(Boolean); // Split and remove empty segments

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const isLast = index === pathSegments.length;
          const formattedSegment =
            segment.charAt(0).toUpperCase() + segment.slice(1); // Capitalize first letter

          return (
            <BreadcrumbItem key={href}>
              {index > 0 && <BreadcrumbSeparator />}{" "}
              {/* Avoids leading separator */}
              {isLast ? (
                <BreadcrumbPage>{formattedSegment}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={href}>{formattedSegment}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
