import { useState, useRef, useEffect, useMemo } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Bell, ChevronDown, Grid3x3, LogOut, Clock } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import AppsGrid from "@/components/AppsGrid";
import { dmy_notifications } from "@/data/dummy";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLogout, useMe } from "@/api/wrappers/auth.wrappers";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { logout, user } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const { mutate: logoutMutation } = useLogout();
  const { data: me } = useMe();

  console.log(me);

  const handleLogout = () => {
    // logout();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/login", { replace: true });
  };

  // Show apps grid if on home page
  const isHomePage = location.pathname === "/";
  const shouldShowApps = isHomePage;

  // Get latest 4 notifications (sorted by date, most recent first)
  const latestNotifications = [...dmy_notifications]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 4);

  // Count unread notifications
  const unreadCount = dmy_notifications.filter((n) => !n.read).length;

  // Breadcrumb items based on current path (يدعم المسار الرئيسي + الفرعي + تسمية أوضح للـ ID)
  const breadcrumbItems = useMemo(() => {
    const labels: Record<string, string> = {
      products: "المنتجات",
      categories: "الفئات",
      orders: "الطلبات",
      customers: "العملاء",
      employees: "الموظفين",
      discounts: "الخصومات",
      notifications: "الإشعارات",
      profile: "الملف الشخصي",
      settings: "الإعدادات",
      "app-store": "متجر التطبيقات",
      accounting: "المحاسبة",
      stats: "إحصائيات المتجر",
      add: "إضافة",
      general: "عام",
      store: "المتجر",
      domain: "النطاق",
      "payment-methods": "طرق الدفع",
      delivery: "التوصيل",
      "terms-and-conditions": "الشروط والأحكام",
    };

    const detailLabels: Record<string, string> = {
      products: "تفاصيل المنتج",
      categories: "تفاصيل الفئة",
      orders: "تفاصيل الطلب",
      customers: "تفاصيل العميل",
      employees: "تفاصيل الموظف",
      discounts: "تفاصيل الخصم",
      notifications: "تفاصيل الإشعار",
    };

    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);

    const items: { href: string; label: string; current: boolean }[] = [];

    // ثم كل جزء من المسار بشكل تراكمي
    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      const key = segment.toLowerCase();
      let mapped = labels[key];

      // لو الجزء الحالي شكله ID (أرقام فقط مثلاً)، نستخدم اسم تفصيلي حسب الجزء السابق
      const looksLikeId = /^[0-9]+$/.test(segment);
      if (!mapped && looksLikeId && index > 0) {
        const parentKey = segments[index - 1].toLowerCase();
        mapped = detailLabels[parentKey];
      }

      // لو ماكو ترجمة معروفة ولا هو ID معروف، نعرض النص نفسه بعد decode
      const label = mapped ?? decodeURIComponent(segment);

      items.push({
        href: currentPath,
        label,
        current: isLast,
      });
    });

    return items;
  }, [location.pathname]);

  // Format date for notification
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-IQ", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Top Bar */}
      <header className="flex py-3 items-center justify-between border-b border-border bg-background px-4 sm:px-6 shadow-sm">
        {/* Left Side - Apps Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className={cn(
              "flex items-center gap-2",
              shouldShowApps && "bg-accent"
            )}
          >
            <Grid3x3 className="w-4 h-4" />
            <span className="hidden sm:inline">التطبيقات</span>
          </Button>
        </div>

        {/* Center - Company Name */}
        <div className="flex-1 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            المشرق الجديد
          </h2>
        </div>

        {/* Right Side - Icons and User */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <div ref={notificationRef} className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative cursor-pointer p-1 rounded-md hover:bg-accent transition-colors"
            >
              <Bell size={20} className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-destructive text-white text-xs font-medium">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-right">
                    الإشعارات
                  </h3>
                </div>
                <div className="overflow-y-auto max-h-64 hide-scrollbar">
                  {latestNotifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      لا توجد إشعارات
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {latestNotifications.map((notification) => (
                        <Link
                          key={notification.id}
                          to={`/notifications/${notification.id}`}
                          onClick={() => setIsNotificationOpen(false)}
                          className={cn(
                            "block p-4 hover:bg-accent transition-colors text-right",
                            !notification.read &&
                              "bg-blue-50/50 dark:bg-blue-950/20"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium line-clamp-1">
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <span className="size-2 rounded-full bg-primary shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="size-3" />
                                <span>
                                  {formatNotificationDate(
                                    notification.created_at
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-border">
                  <Link
                    to="/notifications"
                    onClick={() => setIsNotificationOpen(false)}
                  >
                    <Button variant="outline" className="w-full text-sm">
                      عرض جميع الإشعارات
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 bg-accent rounded-full px-3 py-1.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-cyan text-white text-xs">
                {/* {user?.name?.[0] || "ح"} */}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-end">
              <span className="line-clamp-1 text-xs font-medium text-foreground">
                {me?.fullName || "المستخدم"}
              </span>
              <span className="line-clamp-1 text-xs text-muted-foreground">
                {me?.email || "البريد الإلكتروني"}
              </span>
            </div>
            <div className="relative group">
              <ChevronDown size={16} className="text-muted-foreground" />
              {/* Dropdown Menu */}
              <div className="absolute left-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden w-full custom-scrollbar hide-scrollbar mt-2 rounded-lg">
        {/* Global Breadcrumb - top, aligned to the right */}
        <div className="px-4 sm:px-6 lg:px-8 pt-2">
          <Breadcrumb className="justify-start">
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => (
                <BreadcrumbItem key={item.href + item.label}>
                  {index > 0 && <BreadcrumbSeparator />}
                  {item.current ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {shouldShowApps ? (
          <div className="h-full w-full p-4 sm:p-6 lg:p-8">
            <AppsGrid />
          </div>
        ) : (
          <main>
            <div className="h-full w-full p-4 sm:p-6 lg:p-8 pb-20">
              <Outlet />
              <footer className="h-full w-full justify-center items-center bg-red-50 " />
            </div>
          </main>
        )}
      </main>
    </div>
  );
};
export default Layout;
