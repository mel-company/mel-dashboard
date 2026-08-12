import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import MobileTopBar from "@/components/MobileTopBar";
import { cn } from "@/lib/utils";

const Layout = () => {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
    <div className="relative flex h-dvh w-screen overflow-hidden bg-background">
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
          "fixed inset-y-0 right-0 z-50 transition-transform duration-300 ease-out lg:relative lg:z-10 lg:translate-x-0",
          mobileSidebarOpen
            ? "translate-x-0 shadow-2xl"
            : "translate-x-full lg:translate-x-0",
          "flex",
        )}
        onNavigate={() => setMobileSidebarOpen(false)}
        {...(isPosPage && { collapsed: true })}
      />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Soft brand glow — matches Figma dark atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden dark:block"
        >
          <div className="absolute -top-28 -right-24 size-[480px] rounded-full bg-[#9139c4]/18 blur-[140px]" />
          <div className="absolute -bottom-32 -left-20 size-[380px] rounded-full bg-[#00b7ff]/10 blur-[120px]" />
        </div>

        {showMobileChrome && (
          <MobileTopBar onMenuClick={() => setMobileSidebarOpen(true)} />
        )}

        <main className="custom-scrollbar relative z-10 flex-1 overflow-x-hidden overflow-y-auto">
          <div
            className={cn(
              "w-full",
              isPosPage ? "p-3 lg:p-5" : "p-3 sm:p-6 lg:p-8",
            )}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
