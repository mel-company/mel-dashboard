import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  
  Package,
  List,
  Percent,
  ShoppingCart,
  Users,
  Users2,
  Settings,
  Store,
  Search,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface AppItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  description?: string;
  badge?: string;
}

const apps: AppItem[] = [
  {
    label: "الاحصائيات",
    path: "/",
    icon: BarChart2,
    gradient: "from-blue-500 to-blue-600",
    description: "الاحصائيات العامة",
  },
  {
    label: "المنتجات",
    path: "/products",
    icon: Package,
    gradient: "from-emerald-500 to-emerald-600",
    description: "إدارة المنتجات",
    badge: "جديد",
  },
  {
    label: "الفئات",
    path: "/categories",
    icon: List,
    gradient: "from-violet-500 to-violet-600",
    description: "إدارة الفئات",
  },
  {
    label: "الخصومات",
    path: "/discounts",
    icon: Percent,
    gradient: "from-rose-500 to-rose-600",
    description: "إدارة الخصومات",
    badge: "عروض",
  },
  {
    label: "الطلبات",
    path: "/orders",
    icon: ShoppingCart,
    gradient: "from-orange-500 to-orange-600",
    description: "إدارة الطلبات",
  },
  {
    label: "العملاء",
    path: "/customers",
    icon: Users,
    gradient: "from-cyan-500 to-cyan-600",
    description: "إدارة العملاء",
  },
  {
    label: "الموظفين",
    path: "/employees",
    icon: Users2,
    gradient: "from-indigo-500 to-indigo-600",
    description: "إدارة الموظفين",
  },
  {
    label: "الإعدادات",
    path: "/settings",
    icon: Settings,
    gradient: "from-slate-500 to-slate-600",
    description: "إعدادات النظام",
  },
  {
    label: "معرض القوالب",
    path: "/editor/templates",
    icon: Store,
    gradient: "from-teal-500 to-teal-600",
    description: "قوالب المواقع",
  },
];

const AppsGrid = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = apps.filter(
    (app) =>
      app.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                التطبيقات
              </h1>
              <p className="text-muted-foreground text-sm">
                اختر التطبيق الذي تريد الوصول إليه
              </p>
            </div>
            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="ابحث عن تطبيق..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* Apps Grid */}
        {filteredApps.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredApps.map((app) => {
              const Icon = app.icon;
              const isActive =
                location.pathname === app.path ||
                (app.path !== "/" && location.pathname.startsWith(app.path));

              return (
                <Link
                  key={app.path}
                  to={app.path}
                  className={cn(
                    "group relative flex flex-col items-center justify-center",
                    "p-6 rounded-xl transition-all duration-200",
                    "bg-card border border-border",
                    "hover:shadow-lg hover:shadow-primary/10",
                    "hover:-translate-y-1",
                    isActive && "ring-2 ring-primary shadow-md border-primary"
                  )}
                >
                  {/* Badge */}
                  {app.badge && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg">
                        {app.badge}
                      </span>
                    </div>
                  )}

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}

                  {/* Icon Container */}
                  <div
                    className={cn(
                      "w-16 h-16 rounded-xl flex items-center justify-center mb-4",
                      "bg-gradient-to-br",
                      app.gradient,
                      "shadow-md",
                      "group-hover:shadow-lg group-hover:scale-110",
                      "transition-all duration-200"
                    )}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* App Info */}
                  <div className="text-center w-full">
                    <h3
                      className={cn(
                        "text-sm font-semibold mb-1 transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-foreground group-hover:text-primary"
                      )}
                    >
                      {app.label}
                    </h3>
                    {app.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {app.description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              لا توجد نتائج
            </h3>
            <p className="text-sm text-muted-foreground">
              جرب البحث بكلمات مختلفة
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppsGrid;
