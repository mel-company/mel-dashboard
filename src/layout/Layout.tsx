import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/ui/Sidebar";
import { Bell, ChevronDown, User, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Right Side) */}
      <div
        className={cn(
          "border-l border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out",
          "fixed lg:static inset-y-0 right-0 z-50",
          "w-64",
          isMobileMenuOpen
            ? "translate-x-0"
            : "translate-x-full lg:translate-x-0"
        )}
      >
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>
      {/* Main Content Area (Left Side) */}
      <div className="flex flex-1 flex-col overflow-hidden w-full lg:w-auto">
        {/* Top Bar */}
        <header className="flex py-4 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Right Side - User Profile */}
          <div className="flex items-center justify-between gap-3 bg-accent rounded-full px-3 sm:px-4 py-2 w-[160px] sm:w-[200px]">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-cyan text-white">
                  ح
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-foreground">
                  حسن علي
                </span>
                <span className="text-xs text-muted-foreground">
                  مدير النظام
                </span>
              </div>
            </div>
            <ChevronDown size={20} className="size-5 text-muted-foreground" />
          </div>

          {/* Left Side - Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <div className="relative cursor-pointer">
              <User size={20} className="size-4 sm:size-5" />
            </div>
            <div className="relative cursor-pointer">
              <Bell size={20} className="size-4 sm:size-5" />
              <span className="absolute right-0 top-0 size-2 rounded-full bg-destructive" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="overflow-hidden flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
