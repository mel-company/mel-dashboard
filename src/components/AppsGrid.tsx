import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Package,
  List,
  Percent,
  ShoppingCart,
  Users,
  Users2,
  Settings,
  Search,
  BarChart2,
  Calculator,
  Maximize2,
  Minimize2,
  Lock,
  Bell,
  Ticket,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useApps } from "@/contexts/AppsContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AppItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  description?: string;
  badge?: string;
  emojiIcon?: string;
  locked?: boolean;

  
}

// Base apps - always shown
const baseApps: AppItem[] = [
  {
    label: "الاحصائيات",
    path: "/stats",
    icon: BarChart2,
    gradient: "from-blue-500 to-blue-600",
    description: "إحصائيات وأداء المتجر",
  },
  {
    label: "المنتجات",
    path: "/products",
    icon: Package,
    gradient: "from-emerald-500 to-emerald-600",
    description: "إدارة المنتجات",
    // badge: "جديد",
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
    // badge: "عروض",
  },
  {
    label: "الكوبونات",
    path: "/coupons",
    icon: Ticket,
    gradient: "from-green-500 to-green-600",
    description: "إدارة الكوبونات",
    // badge: "عروض",
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
    label: "الإشعارات",
    path: "/notifications",
    icon: Bell,
    gradient: "from-yellow-500 to-yellow-600",
    description: "إدارة الإشعارات",
  },
  {
    label: "الدعم",
    path: "/tickets",
    icon: MessageCircle,
    gradient: "from-cyan-500 to-cyan-600",
    description: "إدارة الدعم",
  },
  {
    label: "الموظفين",
    path: "/employees",
    icon: Users2,
    gradient: "from-indigo-500 to-indigo-600",
    description: "إدارة الموظفين",
    locked: true,
  },
  {
    label: "الإعدادات",
    path: "/settings",
    icon: Settings,
    gradient: "from-slate-500 to-slate-600",
    description: "إعدادات النظام",
  },
  {
    label: "المحاسبة",
    path: "/accounting",
    icon: Calculator,
    gradient: "from-green-500 to-green-600",
    description: "إدارة الحسابات المالية",
  },
  // {
  //   label: "متجر التطبيقات",
  //   path: "/app-store",
  //   icon: AppWindow,
  //   gradient: "from-purple-500 to-purple-600",
  //   description: "تطبيقات مع إمكانية التكامل",
  //   // badge: "جديد",
  // },
];

// Helper function to convert AppStoreApp to AppItem
const convertToAppItem = (app: {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  path: string;
}): AppItem => {
  // Check if icon is emoji
  const isEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(app.icon);

  return {
    label: app.name,
    path: app.path,
    icon: Calculator, // Default lucide icon (won't be used if emojiIcon exists)
    emojiIcon: isEmoji ? app.icon : undefined,
    gradient: app.gradient,
    description: app.description,
  };
};

type IconSize = "small" | "medium" | "large";

const AppsGrid = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [iconSize, setIconSize] = useState<IconSize>(() => {
    const saved = localStorage.getItem("appsGridIconSize");
    return (saved as IconSize) || "medium";
  });
  const [comingSoonDialogOpen, setComingSoonDialogOpen] = useState(false);
  const { getAllInstalledApps } = useApps();

  // Toggle icon size between small, medium, and large
  const toggleIconSize = () => {
    const sizes: IconSize[] = ["small", "medium", "large"];
    const currentIndex = sizes.indexOf(iconSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    const nextSize = sizes[nextIndex];
    setIconSize(nextSize);
    localStorage.setItem("appsGridIconSize", nextSize);
  };

  // Icon size classes
  const iconSizeClasses = {
    small: {
      icon: "w-6 h-6",
      container: "w-12 h-12",
      grid: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8",
    },
    medium: {
      icon: "w-8 h-8",
      container: "w-16 h-16",
      grid: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
    },
    large: {
      icon: "w-12 h-12",
      container: "w-24 h-24",
      grid: "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    },
  };

  // Get installed apps from context
  const installedAppsData = getAllInstalledApps();

  // Convert installed apps to AppItem format
  const installedAppsItems = useMemo(() => {
    return installedAppsData
      .filter((app) => app.id !== "1") // Exclude accounting as it's already in baseApps
      .map(convertToAppItem);
  }, [installedAppsData]);

  // Combine base apps with installed apps
  const allApps = useMemo(() => {
    return [...baseApps, ...installedAppsItems];
  }, [installedAppsItems]);

  const filteredApps = allApps.filter(
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
            <div className="flex items-center gap-2">
              {/* Icon Size Toggle Button */}
              <button
                onClick={toggleIconSize}
                className="group flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 rounded-lg border-2 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                title={
                  iconSize === "small"
                    ? "صغير - اضغط للتغيير"
                    : iconSize === "medium"
                    ? "متوسط - اضغط للتغيير"
                    : "كبير - اضغط للتغيير"
                }
              >
                {iconSize === "small" ? (
                  <Minimize2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : iconSize === "medium" ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  </div>
                ) : (
                  <Maximize2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {iconSize === "small"
                    ? "صغير"
                    : iconSize === "medium"
                    ? "متوسط"
                    : "كبير"}
                </span>
              </button>
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
        </div>

        {/* Apps Grid */}
        {filteredApps.length > 0 ? (
          <div className={`grid ${iconSizeClasses[iconSize].grid} gap-4`}>
            {filteredApps.map((app) => {
              const Icon = app.icon;
              const currentSize = iconSizeClasses[iconSize];
              const isActive =
                location.pathname === app.path ||
                (app.path !== "/" && location.pathname.startsWith(app.path));
              const isLocked = app.locked === true;

              const AppContent = (
                <>
                  {/* Badge */}
                  {app.badge && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg">
                        {app.badge}
                      </span>
                    </div>
                  )}

                  {/* Lock Icon Overlay */}
                  {isLocked && (
                    <div className="absolute top-2 left-2 z-10">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/90 backdrop-blur-sm border border-border shadow-md">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}

                  {/* Active Indicator */}
                  {isActive && !isLocked && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}

                  {/* Icon Container */}
                  <div
                    className={cn(
                      currentSize.container,
                      "rounded-xl flex items-center justify-center mb-4",
                      "bg-gradient-to-br",
                      app.gradient,
                      "shadow-md",
                      "group-hover:shadow-lg group-hover:scale-110",
                      "transition-all duration-200",
                      isLocked && "opacity-60"
                    )}
                  >
                    {app.emojiIcon ? (
                      <span
                        className={
                          iconSize === "small"
                            ? "text-2xl"
                            : iconSize === "medium"
                            ? "text-3xl"
                            : "text-4xl"
                        }
                      >
                        {app.emojiIcon}
                      </span>
                    ) : (
                      <Icon className={`${currentSize.icon} text-white`} />
                    )}
                  </div>

                  {/* App Info */}
                  <div className="text-center w-full">
                    <h3
                      className={cn(
                        "font-semibold mb-1 transition-colors",
                        iconSize === "small"
                          ? "text-xs"
                          : iconSize === "medium"
                          ? "text-sm"
                          : "text-base",
                        isActive && !isLocked
                          ? "text-primary"
                          : isLocked
                          ? "text-muted-foreground"
                          : "text-foreground group-hover:text-primary"
                      )}
                    >
                      {app.label}
                    </h3>
                    {app.description && (
                      <p
                        className={`line-clamp-2 ${
                          iconSize === "small"
                            ? "text-xs"
                            : iconSize === "medium"
                            ? "text-xs"
                            : "text-sm"
                        } ${
                          isLocked
                            ? "text-muted-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {app.description}
                      </p>
                    )}
                  </div>
                </>
              );

              if (isLocked) {
                return (
                  <button
                    key={app.path}
                    onClick={() => setComingSoonDialogOpen(true)}
                    className={cn(
                      "group relative flex flex-col items-center justify-center",
                      iconSize === "large"
                        ? "p-8"
                        : iconSize === "medium"
                        ? "p-6"
                        : "p-4",
                      "rounded-xl transition-all duration-200",
                      "bg-card border border-border",
                      "hover:shadow-lg hover:shadow-primary/10",
                      "hover:-translate-y-1",
                      "cursor-pointer"
                    )}
                  >
                    {AppContent}
                  </button>
                );
              }

              return (
                <Link
                  key={app.path}
                  to={app.path}
                  className={cn(
                    "group relative flex flex-col items-center justify-center",
                    iconSize === "large"
                      ? "p-8"
                      : iconSize === "medium"
                      ? "p-6"
                      : "p-4",
                    "rounded-xl transition-all duration-200",
                    "bg-card border border-border",
                    "hover:shadow-lg hover:shadow-primary/10",
                    "hover:-translate-y-1",
                    isActive && "ring-2 ring-primary shadow-md border-primary"
                  )}
                >
                  {AppContent}
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

        {/* Coming Soon Dialog */}
        <Dialog
          open={comingSoonDialogOpen}
          onOpenChange={setComingSoonDialogOpen}
        >
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                  <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              <DialogTitle className="text-center text-xl">قريباً</DialogTitle>
              <DialogDescription className="text-center text-base">
                هذا التطبيق قيد التطوير وسيكون متاحاً قريباً. شكراً لصبرك!
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => setComingSoonDialogOpen(false)}
                variant="default"
              >
                إغلاق
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AppsGrid;
