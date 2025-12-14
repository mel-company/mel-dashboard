import { useState } from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { Settings, Store, Globe, Truck, FileText, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {};

const SettingsLayout = ({}: Props) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  ];

  // Redirect to general settings if on /settings
  if (location.pathname === "/settings") {
    return <Navigate to="/settings/general" replace />;
  }

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
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
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/settings" &&
              location.pathname.startsWith(item.path));

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
      <div className="flex-1 overflow-y-auto min-w-0 w-full lg:w-auto pt-16 lg:pt-0">
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsLayout;
