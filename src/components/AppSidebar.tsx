import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Crown,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";

import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { useMe } from "@/api/wrappers/auth.wrappers";
import melLogo from "@/assets/imgs/logo/mel-logo.svg";

import {
  sidebarSections,
  isNavItemActive,
  type SidebarNavItem,
} from "@/config/sidebar-navigation";

type AppSidebarProps = {
  className?: string;
  onNavigate?: () => void;
  collapsed?: boolean;
};

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: SidebarNavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const icon = active ? item.icon.active : item.icon.normal;

  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors",
        active
          ? "bg-sky-500 text-white shadow-sm"
          : "text-sky-900 hover:bg-muted/60 dark:text-muted-foreground",
        collapsed && "justify-center px-2",
      )}
    >
      <HugeiconsIcon icon={icon} className="size-6.5 shrink-0" />
      {!collapsed && (
        <span className="flex-1 text-right text-base font-medium">{item.label}</span>
      )}
    </Link>
  );
}

const AppSidebar = ({ className, onNavigate, collapsed: externalCollapsed }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: me } = useMe();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // Use external collapsed state if provided, otherwise use internal state
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-l border-border/60 bg-card transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-[272px]",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 p-4 pb-2">
        {/* Show toggle button only when not externally controlled (not collapsed) */}
        {externalCollapsed !== true && (
          <button
            type="button"
            onClick={() => setInternalCollapsed((v: boolean) => !v)}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/60"
            aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            {collapsed ? (
              <PanelRightOpen className="size-4" />
            ) : (
              <PanelRightClose className="size-4" />
            )}
          </button>
        )}

        {!collapsed && (
          <div className="min-w-0 flex-1 text-right">
            <div className="flex items-center justify-end gap-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#1e3a8a] dark:text-[#93c5fd]">
                  {me?.store || "منصة ميل"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  متجر إلكتروني
                </p>
              </div>
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-orange-400 to-orange-500 p-1.5">
                <img
                  src={melLogo}
                  alt=""
                  className="size-full object-contain brightness-0 invert"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2 custom-scrollbar">
        {sidebarSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-1.5 px-2 text-right text-sm text-slate-500/80 dark:text-slate-400 font-normal">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.path + item.label}
                  item={item}
                  active={isNavItemActive(location.pathname, item)}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Subscription footer */}
      {!collapsed && (
        <div className="p-3 pt-0">
          <button
            type="button"
            onClick={() => {
              navigate("/settings/store");
              onNavigate?.();
            }}
            className="flex w-full items-center gap-2 rounded-2xl bg-[#0f172a] px-3 py-3 text-white transition-opacity hover:opacity-95"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#00b7ff]/20">
              <img src={melLogo} alt="" className="size-5 object-contain" />
            </div>
            <span className="flex-1 text-right text-sm font-medium">
              الاشتراك الاحترافي
            </span>
            <ChevronDown className="size-4 shrink-0 text-white/70" />
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#5733ea] to-[#00b7ff] shadow-[0_0_12px_rgba(0,183,255,0.45)]">
              <Crown className="size-4 text-white" strokeWidth={1.75} />
            </div>
          </button>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
