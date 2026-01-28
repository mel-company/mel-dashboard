import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import {
  Settings,
  Store,
  Globe,
  Truck,
  FileText,
  Menu,
  X,
  CreditCard,
  Shield,
  Book,
  ChevronDown,
  ChevronUp,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const settingsItems = [
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
    label: "الدفع",
    path: "/settings/payment-methods",
    icon: CreditCard,
  },
  {
    label: "التوصيل",
    path: "/settings/delivery",
    icon: Truck,
  },
  // {
  //   label: "الموقع",
  //   path: "/settings/editor",
  //   icon: Code,
  // },
  {
    label: "النطاق",
    path: "/settings/domain",
    icon: Globe,
  },
  {
    label: "الاشتراك",
    path: "/settings/subscription",
    icon: CreditCard,
  },
  {
    label: "سياسات المتجر",
    path: "/settings/policies",
    icon: Book,
    subItems: [
      {
        label: "الشروط والأحكام",
        path: "/settings/policies/terms-and-conditions",
        icon: FileText,
      },
      {
        label: "سياسة الخصوصية",
        path: "/settings/policies/privacy-policy",
        icon: Shield,
      },
      {
        label: "سياسة الإسترداد",
        path: "/settings/policies/refund-policy",
        icon: CreditCard,
      },
    ],
  },
  {
    label: "اختصارات",
    path: "/settings/shortcuts",
    icon: Keyboard,
  },
];

const SettingsLayout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Auto-expand policies dropdown if on any policy page
  useEffect(() => {
    const isOnPolicyPage =
      location.pathname.startsWith("/settings/policies/terms-and-conditions") ||
      location.pathname.startsWith("/settings/policies/privacy-policy") ||
      location.pathname.startsWith("/settings/policies/refund-policy");

    const policiesPath = "/settings/policies";
    if (isOnPolicyPage) {
      setExpandedItems((prev) =>
        prev.includes(policiesPath) ? prev : [...prev, policiesPath]
      );
    }
  }, [location.pathname]);

  // Redirect to general settings if on /settings
  if (location.pathname === "/settings") {
    return <Navigate to="/settings/general" replace />;
  }

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleDropdown = (itemPath: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemPath)
        ? prev.filter((path) => path !== itemPath)
        : [...prev, itemPath]
    );
  };

  const SidebarContent = ({
    showCloseButton = false,
  }: {
    showCloseButton?: boolean;
  }) => (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">الإعدادات</h2>
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <nav className="flex flex-col gap-1">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedItems.includes(item.path);

          // Check if any sub-item is active
          const isSubItemActive = hasSubItems
            ? item.subItems?.some(
                (subItem) => location.pathname === subItem.path
              )
            : false;

          const isActive =
            !hasSubItems &&
            (location.pathname === item.path ||
              (item.path !== "/settings" &&
                location.pathname.startsWith(item.path)));

          if (hasSubItems) {
            return (
              <div key={item.path} className="flex flex-col gap-1">
                <button
                  onClick={() => toggleDropdown(item.path)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors w-full",
                    isSubItemActive || isExpanded
                      ? ""
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="size-4 shrink-0" />
                  ) : (
                    <ChevronDown className="size-4 shrink-0" />
                  )}
                </button>
                {isExpanded && (
                  <div className="flex flex-col gap-1 pr-4 mt-1">
                    {item.subItems?.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = location.pathname === subItem.path;
                      return (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={handleLinkClick}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            isSubActive
                              ? "bg-primary/80 text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <SubIcon className="size-3.5 shrink-0" />
                          <span>{subItem.label}</span>
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
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex h-full w-full gap-0 lg:gap-6 relative">
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-20 right-4 z-40 shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Right Sidebar Navigation - Desktop */}
      <aside className="hidden lg:block w-64 shrink-0 border-l border-border bg-background/50">
        <div className="sticky top-0 p-6">
          <SidebarContent showCloseButton={false} />
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-64 bg-background border-l border-border z-50 transform transition-transform duration-300 ease-in-out lg:hidden shadow-xl",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-6 h-full overflow-y-auto">
          <SidebarContent showCloseButton={true} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto min-w-0 w-full lg:w-auto lg:pt-0">
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsLayout;
