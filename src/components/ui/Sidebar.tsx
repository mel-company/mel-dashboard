import { useState, useEffect, useMemo } from "react";
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
  X,
  Globe,
  Settings,
  FileText,
  Truck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );

  const navItems = useMemo(
    () => [
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
        subItems: [
          {
            label: "عامة",
            path: "/settings/general",
            icon: Settings,
          },
          {
            label: "المتجر",
            path: "/settings/store",
            icon: Store,
          },
          {
            label: "النطاق",
            path: "/settings/domain",
            icon: Globe,
          },
          {
            label: "الدفع",
            path: "/settings/payment-methods",
            icon: Truck,
          },
          {
            label: "التوصيل",
            path: "/settings/delivery",
            icon: Truck,
          },
          {
            label: "الشروط والأحكام",
            path: "/settings/terms-and-conditions",
            icon: FileText,
          },
        ],
        icon: Settings,
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
    ],
    []
  );

  // Auto-open dropdowns when a subItem is active
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.subItems && item.subItems.length > 0) {
        const isAnySubItemActive = item.subItems.some(
          (subItem) =>
            location.pathname === subItem.path ||
            (subItem.path !== "/" && location.pathname.startsWith(subItem.path))
        );
        if (isAnySubItemActive) {
          setOpenDropdowns((prev) => ({ ...prev, [item.path]: true }));
        }
      }
    });
  }, [location.pathname, navItems]);

  return (
    <div className="flex h-full flex-col pt-[35px] pb-[35px] pl-[2px] pr-[2px] mt-0 mb-0 bg-sidebar">
      <div className="mb-8 px-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan rounded-full"></div>
          <h2 className="text-lg font-semibold text-sidebar-foreground">
            المشرق الجديد
          </h2>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-2"></div>
      <nav className="flex flex-1 flex-col justify-start items-start gap-[11px] pt-0 pb-0 overflow-y-auto hide-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isDropdownOpen = openDropdowns[item.path] ?? false;

          // Check if parent or any subItem is active
          const isParentActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));

          const isAnySubItemActive = hasSubItems
            ? item.subItems?.some(
                (subItem) =>
                  location.pathname === subItem.path ||
                  (subItem.path !== "/" &&
                    location.pathname.startsWith(subItem.path))
              )
            : false;

          const isActive = isParentActive || isAnySubItemActive;

          const toggleDropdown = () => {
            setOpenDropdowns((prev) => ({
              ...prev,
              [item.path]: !prev[item.path],
            }));
          };

          if (hasSubItems) {
            return (
              <div key={item.path} className="w-full">
                <button
                  onClick={toggleDropdown}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors w-full",
                    isActive
                      ? "bg-dark-blue text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
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
                  </div>
                  {isDropdownOpen ? (
                    <ChevronUp
                      className={cn(
                        "size-4",
                        isActive ? "text-white" : "text-sidebar-foreground/70"
                      )}
                    />
                  ) : (
                    <ChevronDown
                      className={cn(
                        "size-4",
                        isActive ? "text-white" : "text-sidebar-foreground/70"
                      )}
                    />
                  )}
                </button>
                {isDropdownOpen && (
                  <div className="mt-1 mr-4 flex flex-col gap-1">
                    {item.subItems?.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubItemActive =
                        location.pathname === subItem.path ||
                        (subItem.path !== "/" &&
                          location.pathname.startsWith(subItem.path));

                      return (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={() => onClose?.()}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            isSubItemActive
                              ? "bg-dark-blue/80 text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                          )}
                        >
                          <SubIcon
                            className={cn(
                              "size-4",
                              isSubItemActive
                                ? "text-white"
                                : "text-sidebar-foreground/60"
                            )}
                          />
                          <span
                            className={cn(
                              isSubItemActive
                                ? "text-white"
                                : "text-sidebar-foreground/60"
                            )}
                          >
                            {subItem.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => onClose?.()}
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
