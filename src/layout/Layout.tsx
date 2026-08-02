import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppsGrid from "@/components/AppsGrid";
import AppSidebar from "@/components/AppSidebar";
import MobileTopBar from "@/components/MobileTopBar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { cn } from "@/lib/utils";

const Layout = () => {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isHomePage = location.pathname === "/";
  const shouldShowApps = isHomePage;
  const isPosPage = location.pathname === "/pos";
  const showMobileChrome = !isPosPage;

  // Close drawer on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="flex h-dvh w-screen overflow-hidden bg-[#f4f7fb] dark:bg-background">
      {/* Mobile drawer backdrop */}
      <button
        type="button"
        className={cn(
          "fixed inset-0 z-40 bg-black/45 transition-opacity duration-300 lg:hidden",
          mobileSidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-label="إغلاق القائمة"
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* Sidebar: drawer on mobile, static on desktop */}
      <AppSidebar
        className={cn(
          "fixed inset-y-0 right-0 z-50 transition-transform duration-300 ease-out lg:relative lg:z-auto lg:translate-x-0",
          mobileSidebarOpen
            ? "translate-x-0 shadow-2xl"
            : "translate-x-full lg:translate-x-0",
          "flex",
        )}
        onNavigate={() => setMobileSidebarOpen(false)}
        {...(isPosPage && { collapsed: true })}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {showMobileChrome && <MobileTopBar />}

        <main
          className={cn(
            "custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto",
            showMobileChrome && "pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0",
          )}
        >
          {shouldShowApps ? (
            <div className="h-full w-full p-3 sm:p-6 lg:p-8">
              <AppsGrid />
            </div>
          ) : (
            <div
              className={cn(
                "w-full",
                isPosPage ? "p-3 lg:p-5" : "p-3 sm:p-6 lg:p-8",
              )}
            >
              <Outlet />
            </div>
          )}
        </main>

        {showMobileChrome && (
          <MobileBottomNav onMoreClick={() => setMobileSidebarOpen(true)} />
        )}
      </div>
    </div>
  );
};

export default Layout;
