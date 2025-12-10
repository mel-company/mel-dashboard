import { Link, useLocation } from "react-router-dom";
import {
  Home,
  List,
  Package,
  Percent,
  ShoppingCart,
  Users,
  Users2,
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
  ];

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-8 px-2 flex items-center gap-2">
        <div className="w-8 h-8 bg-cyan rounded-full"></div>
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          المشرق الجديد
        </h2>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
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
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
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
