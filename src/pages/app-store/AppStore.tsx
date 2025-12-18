import { useState, useEffect } from "react";
import { Search, Download, Check, Zap, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useApps } from "@/contexts/AppsContext";
import { toast } from "sonner";

interface App {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  gradient: string;
  installed: boolean;
  integration: boolean;
  rating: number;
  downloads: number;
  path?: string;
}

const apps: App[] = [
  {
    id: "1",
    name: "المحاسبة",
    description: "نظام محاسبي متكامل لإدارة الحسابات المالية والفواتير",
    category: "مالية",
    icon: "💰",
    gradient: "from-green-500 to-green-600",
    installed: true,
    integration: true,
    rating: 4.8,
    downloads: 1250,
    path: "/accounting",
  },
  {
    id: "2",
    name: "إدارة المخزون",
    description: "تتبع وإدارة المخزون بشكل احترافي",
    category: "إدارة",
    icon: "📦",
    gradient: "from-blue-500 to-blue-600",
    installed: false,
    integration: true,
    rating: 4.6,
    downloads: 890,
  },
  {
    id: "3",
    name: "التقارير المتقدمة",
    description: "تقارير تفصيلية وتحليلات متقدمة",
    category: "تحليلات",
    icon: "📊",
    gradient: "from-purple-500 to-purple-600",
    installed: false,
    integration: true,
    rating: 4.9,
    downloads: 2100,
  },
  {
    id: "4",
    name: "التسويق الإلكتروني",
    description: "أدوات تسويقية متقدمة للبريد الإلكتروني ووسائل التواصل",
    category: "تسويق",
    icon: "📧",
    gradient: "from-orange-500 to-orange-600",
    installed: false,
    integration: true,
    rating: 4.7,
    downloads: 1560,
  },
  {
    id: "5",
    name: "دعم العملاء",
    description: "نظام تذاكر الدعم الفني وإدارة الطلبات",
    category: "خدمة",
    icon: "🎫",
    gradient: "from-cyan-500 to-cyan-600",
    installed: false,
    integration: true,
    rating: 4.5,
    downloads: 980,
  },
  {
    id: "6",
    name: "إدارة الموارد البشرية",
    description: "نظام شامل لإدارة الموظفين والحضور والرواتب",
    category: "موارد بشرية",
    icon: "👥",
    gradient: "from-indigo-500 to-indigo-600",
    installed: false,
    integration: true,
    rating: 4.8,
    downloads: 1340,
  },
];

const categories = [
  "الكل",
  "مالية",
  "إدارة",
  "تحليلات",
  "تسويق",
  "خدمة",
  "موارد بشرية",
];

const AppStore = () => {
  const navigate = useNavigate();
  const { installedApps, installApp, uninstallApp } = useApps();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  // Initialize installed apps from context
  useEffect(() => {
    apps.forEach((app) => {
      if (app.installed && !installedApps.includes(app.id)) {
        installApp(app.id, {
          id: app.id,
          name: app.name,
          description: app.description,
          category: app.category,
          icon: app.icon,
          gradient: app.gradient,
          path: app.path || `/${app.name.toLowerCase().replace(/\s+/g, "-")}`,
          integration: app.integration,
          rating: app.rating,
          downloads: app.downloads,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "الكل" || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = (app: App) => {
    installApp(app.id, {
      id: app.id,
      name: app.name,
      description: app.description,
      category: app.category,
      icon: app.icon,
      gradient: app.gradient,
      path: app.path || `/${app.name.toLowerCase().replace(/\s+/g, "-")}`,
      integration: app.integration,
      rating: app.rating,
      downloads: app.downloads,
    });
    toast.success(`تم تثبيت ${app.name} بنجاح`);
  };

  const handleUninstall = (appId: string, appName: string) => {
    uninstallApp(appId);
    toast.success(`تم إلغاء تثبيت ${appName} بنجاح`);
  };

  const handleOpen = (app: App) => {
    if (app.path) {
      navigate(app.path);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            متجر التطبيقات
          </h1>
          <p className="text-muted-foreground text-sm">
            اكتشف وثبت التطبيقات المتكاملة مع نظامك
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
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

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Apps Grid */}
        {filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => {
              const isInstalled = installedApps.includes(app.id);
              return (
                <Card
                  key={app.id}
                  className={cn(
                    "p-6 hover:shadow-lg transition-all duration-200",
                    "border border-border bg-card"
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-xl flex items-center justify-center text-3xl",
                        "bg-gradient-to-br",
                        app.gradient,
                        "shadow-md"
                      )}
                    >
                      {app.icon}
                    </div>
                    {app.integration && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 text-xs"
                      >
                        <Zap className="w-3 h-3" />
                        متكامل
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {app.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {app.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span>⭐</span>
                        <span>{app.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>{app.downloads}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {app.category}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {isInstalled ? (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleUninstall(app.id, app.name)}
                        >
                          <Check className="w-4 h-4 ml-2" />
                          مثبت
                        </Button>
                        <Button
                          variant="default"
                          className="flex-1"
                          onClick={() => handleOpen(app)}
                        >
                          فتح
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => handleInstall(app)}
                      >
                        <Download className="w-4 h-4 ml-2" />
                        تثبيت
                      </Button>
                    )}
                  </div>

                  {app.integration && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="w-3 h-3" />
                        <span>متكامل بشكل آمن مع النظام</span>
                      </div>
                    </div>
                  )}
                </Card>
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
              جرب البحث بكلمات مختلفة أو اختر فئة أخرى
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppStore;
