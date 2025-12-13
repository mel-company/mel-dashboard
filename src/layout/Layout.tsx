import { Outlet } from "react-router-dom";
import Sidebar from "@/components/ui/Sidebar";
import { Bell, ChevronDown, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Layout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar (Right Side) */}
      <div className="border-l border-sidebar-border w-64 bg-sidebar">
        <Sidebar />
      </div>
      {/* Main Content Area (Left Side) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex py-4  items-center justify-between border-b border-border bg-background px-6">
          {/* Right Side - User Profile */}
          <div className="flex items-center justify-between gap-3 bg-accent rounded-full px-4 py-2 w-[200px]">
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
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="relative cursor-pointer">
              <User size={20} className="size-5" />
            </div>
            <div className="relative cursor-pointer">
              <Bell size={20} className="size-5" />
              <span className="absolute right-0 top-0 size-2 rounded-full bg-destructive" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="overflow-hidden flex-1 overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
