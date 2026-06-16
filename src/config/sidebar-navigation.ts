import {
  Home,
  Bell,
  Package,
  LayoutGrid,
  Ticket,
  Headphones,
  Receipt,
  ShoppingBasket,
  Users,
  User,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type SidebarNavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  matchPaths?: string[];
};

export type SidebarSection = {
  title: string;
  items: SidebarNavItem[];
};

export const sidebarSections: SidebarSection[] = [
  {
    title: "معلومات النظام",
    items: [
      { label: "الرئيسية", path: "/", icon: Home },
      { label: "الإشعارات", path: "/notifications", icon: Bell },
    ],
  },
  {
    title: "إدارة المتجر",
    items: [
      {
        label: "المنتجات",
        path: "/products",
        icon: Package,
        matchPaths: ["/products"],
      },
      {
        label: "الفئات",
        path: "/categories",
        icon: LayoutGrid,
        matchPaths: ["/categories", "/category-group"],
      },
      {
        label: "الخصومات والكوبونات",
        path: "/discounts",
        icon: Ticket,
        matchPaths: ["/discounts", "/coupons"],
      },
    ],
  },
  {
    title: "الحركة والمبيعات",
    items: [
      { label: "الدعم", path: "/tickets", icon: Headphones },
      { label: "الطلبات", path: "/orders", icon: Receipt },
      { label: "نقطة البيع", path: "/pos", icon: ShoppingBasket },
      { label: "العملاء", path: "/customers", icon: Users },
    ],
  },
  {
    title: "الفريق والإعدادات",
    items: [
      { label: "الموظفين", path: "/employees", icon: User },
      {
        label: "الإعدادات",
        path: "/settings",
        icon: Settings,
        matchPaths: ["/settings"],
      },
    ],
  },
];

export function isNavItemActive(
  pathname: string,
  item: SidebarNavItem,
): boolean {
  if (item.path === "/") return pathname === "/";
  const paths = item.matchPaths ?? [item.path];
  return paths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
