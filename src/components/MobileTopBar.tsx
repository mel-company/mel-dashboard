import { Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useMe } from "@/api/wrappers/auth.wrappers";
import { usePage } from "@/hooks/pages";
import { cn } from "@/lib/utils";

type MobileTopBarProps = {
  className?: string;
};

const MobileTopBar = ({ className }: MobileTopBarProps) => {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const { currentPage } = usePage();
  const unreadCount = me?.notificationsCount || 0;
  const title = currentPage?.label || me?.store || "منصة ميل";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-card/95 px-3 py-2.5 backdrop-blur-md lg:hidden",
        "pt-[max(0.625rem,env(safe-area-inset-top))]",
        className,
      )}
    >
      <div className="min-w-0 flex-1 text-right">
        <h1 className="truncate text-base font-bold text-foreground">{title}</h1>
        {me?.store && currentPage?.label ? (
          <p className="truncate text-[11px] text-muted-foreground">{me.store}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="relative flex size-11 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors active:bg-muted"
          aria-label="الإشعارات"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute end-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <Link
          to="/profile"
          className="flex size-11 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white"
          aria-label="الملف الشخصي"
        >
          {me?.fullName?.[0] || "م"}
        </Link>
      </div>
    </header>
  );
};

export default MobileTopBar;
