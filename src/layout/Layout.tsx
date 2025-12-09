import { Outlet } from "react-router-dom";
import Sidebar from "@/components/ui/Sidebar";
import { Bell, User, Search } from "lucide-react";

type Props = {};

const Layout = ({}: Props) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar (Right Side) */}
      <div className="border-l border-sidebar-border w-64 bg-sidebar">
        <Sidebar />
      </div>
      {/* Main Content Area (Left Side) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
          {/* Right Side - Search Bar */}
          <div className="relative w-full max-w-md">
            <Search
              size={20}
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              placeholder="ابحث من هنا"
              className="w-full text-right rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
            />
          </div>

          {/* Left Side - Icons */}
          <div className="flex items-center gap-3">
            <div className="relative cursor-pointer">
              <Bell size={20} className="size-5" />
              <span className="absolute right-0 top-0 size-2 rounded-full bg-destructive" />
            </div>
            <div className="relative cursor-pointer">
              <User size={20} className="size-5" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
