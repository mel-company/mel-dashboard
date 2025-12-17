import { useState, useRef, useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppsGrid from "@/components/AppsGrid";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import TopBar from "@/components/TopBar";

const Layout = () => {
  const location = useLocation();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Show apps grid if on home page
  const isHomePage = location.pathname === "/";
  const shouldShowApps = isHomePage;

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
      <TopBar />

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
