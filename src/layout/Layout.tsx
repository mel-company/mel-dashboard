import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Bell, ChevronDown, Grid3x3, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import AppsGrid from "@/components/AppsGrid";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/login", { replace: true });
  };

  // Show apps grid if on home page
  const isHomePage = location.pathname === "/";
  const shouldShowApps = isHomePage;

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
          <div className="relative cursor-pointer">
            <Bell size={20} className="size-5" />
            <span className="absolute right-0 top-0 size-2 rounded-full bg-destructive" />
          </div>
          <div className="flex items-center gap-2 bg-accent rounded-full px-3 py-1.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-cyan text-white text-xs">
                {user?.name?.[0] || "ح"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-foreground">
                {user?.name || "حسن علي"}
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.email || "مدير النظام"}
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
