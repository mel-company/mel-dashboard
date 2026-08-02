import { Link, useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home12Icon,
  Package02Icon,
  ShippingLoadingIcon,
  UserGroup03Icon,
  GridViewIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import {
  Home12Icon as Home12IconActive,
  Package02Icon as Package02IconActive,
  ShippingLoadingIcon as ShippingLoadingIconActive,
  UserGroup03Icon as UserGroup03IconActive,
  GridViewIcon as GridViewIconActive,
} from "@hugeicons-pro/core-solid-rounded";
import { cn } from "@/lib/utils";

type MobileBottomNavProps = {
  onMoreClick?: () => void;
  className?: string;
};

const tabs = [
  {
    key: "home",
    label: "الرئيسية",
    path: "/",
    icon: Home12Icon,
    activeIcon: Home12IconActive,
    match: (pathname: string) => pathname === "/",
  },
  {
    key: "products",
    label: "المنتجات",
    path: "/products",
    icon: Package02Icon,
    activeIcon: Package02IconActive,
    match: (pathname: string) =>
      pathname === "/products" || pathname.startsWith("/products/"),
  },
  {
    key: "orders",
    label: "الطلبات",
    path: "/orders",
    icon: ShippingLoadingIcon,
    activeIcon: ShippingLoadingIconActive,
    match: (pathname: string) =>
      pathname === "/orders" || pathname.startsWith("/orders/"),
  },
  {
    key: "customers",
    label: "العملاء",
    path: "/customers",
    icon: UserGroup03Icon,
    activeIcon: UserGroup03IconActive,
    match: (pathname: string) =>
      pathname === "/customers" || pathname.startsWith("/customers/"),
  },
] as const;

const MobileBottomNav = ({ onMoreClick, className }: MobileBottomNavProps) => {
  const location = useLocation();
  const isMoreActive = !tabs.some((tab) => tab.match(location.pathname));

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-md lg:hidden",
        "pb-[env(safe-area-inset-bottom)]",
        className,
      )}
      aria-label="التنقل السفلي"
    >
      <div className="mx-auto grid h-14 max-w-lg grid-cols-5 items-stretch px-1">
        {tabs.map((tab) => {
          const active = tab.match(location.pathname);
          return (
            <Link
              key={tab.key}
              to={tab.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 transition-colors",
                active
                  ? "text-sky-600 dark:text-sky-300"
                  : "text-muted-foreground active:bg-muted/60",
              )}
            >
              <HugeiconsIcon
                icon={active ? tab.activeIcon : tab.icon}
                className="size-6"
              />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onMoreClick}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 transition-colors",
            isMoreActive
              ? "text-sky-600 dark:text-sky-300"
              : "text-muted-foreground active:bg-muted/60",
          )}
          aria-label="المزيد"
        >
          <HugeiconsIcon
            icon={isMoreActive ? GridViewIconActive : GridViewIcon}
            className="size-6"
          />
          <span className="text-[10px] font-medium leading-none">المزيد</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
