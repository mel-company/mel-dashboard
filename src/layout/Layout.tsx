import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppsGrid from "@/components/AppsGrid";
import AppSidebar from "@/components/AppSidebar";
import { cn } from "@/lib/utils";

const Layout = () => {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isHomePage = location.pathname === "/";
  const shouldShowApps = isHomePage;
  const hideSidebar = false; // Never hide sidebar completely
  const isPosPage = location.pathname === "/pos";

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
          {...(isPosPage && { collapsed: true })}
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
                hideSidebar ? "p-0" : isPosPage ? "p-4 lg:p-5" : "p-4 sm:p-6 lg:p-8",
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
