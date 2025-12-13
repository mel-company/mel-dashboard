import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  Home,
  List,
  Package,
  Percent,
  ShoppingCart,
  User,
  Users,
  Users2,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {};

const Sidebar = ({}: Props) => {
  const location = useLocation();

  const navItems = [
    {
      label: "الرئيسية",
      path: "/",
      icon: Home,
    },
    {
      label: "المنتجات",
      path: "/products",
      icon: Package,
    },
    {
      label: "الفئات",
      path: "/categories",
      icon: List,
    },
    {
      label: "الخصومات",
      path: "/discounts",
      icon: Percent,
    },
    {
      label: "الطلبات",
      path: "/orders",
      icon: ShoppingCart,
    },
    {
      label: "العملاء",
      path: "/customers",
      icon: Users,
    },
    {
      label: "الموظفين",
      path: "/employees",
      icon: Users2,
    },
    {
      label: "الإشعارات",
      path: "/notifications",
      icon: Bell,
    },
    {
      label: "الإعدادات",
      path: "/settings",
      icon: User,
    },
    {
      label: "الملف الشخصي",
      path: "/profile",
      icon: User,
    },
   
    {
      label: "معرض القوالب",
      path: "/editor/templates",
      icon: Store,
    },
  ];

  return (
    <div className="flex h-full flex-col pt-[35px] pb-[35px] pl-[2px] pr-[2px] mt-0 mb-0 bg-white">
      <div className="mb-8 px-2 flex items-center gap-2">
        <div className="w-8 h-8 bg-cyan rounded-full"></div>
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          المشرق الجديد
        </h2>
      </div>
      <nav className="flex flex-1 flex-col justify-start items-start gap-[11px] pt-0 pb-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors w-full",
                isActive
                  ? "bg-dark-blue text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon
                className={cn(
                  isActive ? "text-white" : "text-sidebar-foreground/70"
                )}
              />
              <span
                className={cn(
                  isActive ? "text-white" : "text-sidebar-foreground/70"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
