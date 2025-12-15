import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const Breadcrumb = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => (
  <nav
    aria-label="breadcrumb"
    className={cn(
      "flex items-center text-xs sm:text-sm text-muted-foreground",
      className
    )}
    {...props}
  />
);

const BreadcrumbList = ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
  <ol
    className={cn("flex flex-wrap items-center gap-1 sm:gap-1.5", className)}
    {...props}
  />
);

const BreadcrumbItem = ({
  className,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) => (
  <li className={cn("inline-flex items-center gap-1", className)} {...props} />
);

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    role="presentation"
    className={cn(
      "flex items-center text-[10px] sm:text-xs text-muted-foreground/70",
      className
    )}
    {...props}
  >
    {children ?? <ChevronLeft className="w-3 h-3" />}
  </span>
);

const BreadcrumbLink = ({
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a
    className={cn(
      "transition-colors hover:text-primary font-medium",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm",
      className
    )}
    {...props}
  />
);

const BreadcrumbPage = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    aria-current="page"
    className={cn("font-semibold text-foreground", className)}
    {...props}
  />
);

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbPage,
};
