import { useState, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppsGrid from "@/components/AppsGrid";
import QuickNavigate from "@/components/QuickNavigate";
import AppSidebar from "@/components/AppSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import TopBar from "@/components/TopBar";
import { cn } from "@/lib/utils";

const Layout = () => {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isHomePage = location.pathname === "/";
  const shouldShowApps = isHomePage;
  const hideSidebar = location.pathname === "/pos";

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
      stats: "إحصائيات المتجر",
      add: "إضافة",
      new: "إضافة",
      general: "عام",
      store: "المتجر",
      domain: "النطاق",
      "payment-methods": "طرق الدفع",
      delivery: "التوصيل",
      "terms-and-conditions": "الشروط والأحكام",
      website: "الموقع",
      edit: "تعديل",
      plans: "الاشتراكات",
      payment: "الدفع",
      pos: "نقطة البيع",
      policies: "سياسات المتجر",
      "privacy-policy": "سياسة الخصوصية",
      "refund-policy": "سياسة الإسترداد",
      subscription: "الاشتراك",
      coupons: "الكوبونات",
      tickets: "الدعم",
      "category-group": "المجموعات",
    };

    const detailLabels: Record<string, string> = {
      products: "تفاصيل المنتج",
      categories: "تفاصيل الفئة",
      orders: "تفاصيل الطلب",
      customers: "تفاصيل العميل",
      employees: "تفاصيل الموظف",
      discounts: "تفاصيل الخصم",
      notifications: "تفاصيل الإشعار",
      payment: "تفاصيل الدفع",
      coupons: "تفاصيل الكوبون",
      tickets: "تفاصيل التذكرة",
      "category-group": "تفاصيل المجموعة",
    };

    const segments = location.pathname.split("/").filter(Boolean);
    const items: { href: string; label: string; current: boolean }[] = [];
    let currentPath = "";

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      const key = segment.toLowerCase();
      let mapped = labels[key];

      const looksLikeUuid =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
          segment,
        );
      if (!mapped && looksLikeUuid && index > 0) {
        mapped = detailLabels[segments[index - 1].toLowerCase()];
      }

      items.push({
        href: currentPath,
        label: mapped ?? decodeURIComponent(segment),
        current: isLast,
      });
    });

    return items;
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4f7fb] dark:bg-background">
      {/* Mobile sidebar overlay */}
      {!hideSidebar && mobileSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="إغلاق القائمة"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {!hideSidebar && (
        <AppSidebar
          className={cn(
            "fixed inset-y-0 right-0 z-50 lg:relative lg:z-auto",
            mobileSidebarOpen ? "flex" : "hidden lg:flex",
          )}
          onNavigate={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* <TopBar onMenuClick={() => setMobileSidebarOpen(true)} hideSidebar={hideSidebar} /> */}
        {/* <QuickNavigate /> */}

        <main className="custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto">


          {shouldShowApps ? (
            <div className="h-full w-full p-4 sm:p-6 lg:p-8">
              <AppsGrid />
            </div>
          ) : (
            <div
              className={cn(
                "w-full",
                hideSidebar ? "p-0" : "p-4 sm:p-6 lg:p-8",
              )}
            >
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;
