import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  LogOut,
} from "lucide-react";

import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { useLogout, useMe } from "@/api/wrappers/auth.wrappers";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import melLogo from "@/assets/imgs/logo/mel-logo.svg";
import { getImageUrl } from "@/utils/image-url";
import { toast } from "sonner";

import {
  getSidebarSections,
  isNavItemActive,
  type SidebarNavItem,
} from "@/config/sidebar-navigation";
import { usePhysicalStoreEnabled } from "@/hooks/use-physical-store";

type AppSidebarProps = {
  className?: string;
  onNavigate?: () => void;
  collapsed?: boolean;
};

function getInitials(value?: string) {
  if (!value?.trim()) return "MA";
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return value.slice(0, 2).toUpperCase();
}

function SidebarStoreLogo({ storeLogoUrl }: { storeLogoUrl: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
  }, [storeLogoUrl]);

  return (
    <>
      {storeLogoUrl ? (
        <img
          src={storeLogoUrl}
          alt=""
          className={cn("size-full object-cover", !ready && "hidden")}
          onLoad={() => setReady(true)}
          onError={() => setReady(false)}
        />
      ) : null}
      {!ready ? (
        <img src={melLogo} alt="mel.iq" className="size-5 object-contain" />
      ) : null}
    </>
  );
}

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
      dir="rtl"
      className={cn(
        "relative flex items-center gap-2.5 overflow-hidden transition-all",
        collapsed
          ? cn(
              "mx-auto size-11 justify-center rounded-2xl",
              active
                ? "text-white shadow-lg shadow-violet-500/25"
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5",
            )
          : cn(
              "w-full flex-row rounded-full px-3.5 py-2.5",
              active
                ? "text-white shadow-lg shadow-sky-500/20"
                : "rounded-2xl text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/4",
            ),
      )}
    >
      {active ? (
        <>
          {/* Selected background — purple → cyan like Figma */}
          <span
            aria-hidden
            className="absolute inset-0 bg-linear-to-l from-[#5B8CFF] via-[#6B6BFF] to-[#8B5CF6]"
          />
          <span
            aria-hidden
            className="absolute -left-6 top-1/2 size-24 -translate-y-1/2 rounded-full bg-[#3B82F6]/55 blur-[2px]"
          />
          <span
            aria-hidden
            className="absolute -right-4 -top-8 size-28 rounded-full bg-[#A78BFA]/45 blur-[1px]"
          />
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-[#4F46E5]/35 to-transparent"
          />
        </>
      ) : null}

      {/* RTL: icon on the right, label to its left */}
      <HugeiconsIcon
        icon={icon}
        className={cn(
          "relative z-10 size-5 shrink-0",
          active ? "text-white" : "text-slate-500 dark:text-slate-400",
        )}
      />
      {!collapsed && (
        <span
          className={cn(
            "relative z-10 min-w-0 flex-1 text-right text-[15px] font-medium",
            active && "text-white",
          )}
        >
          {item.label}
        </span>
      )}
    </Link>
  );
}

const AppSidebar = ({
  className,
  onNavigate,
  collapsed: externalCollapsed,
}: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: me } = useMe();
  const { data: storeDetails } = useFetchStoreDetails();
  const storeLogoUrl = getImageUrl(storeDetails?.logo, storeDetails?.baseUrl);
  const { mutate: logoutMutation, isPending: isLoggingOut } = useLogout();
  const { isPhysicalStore } = usePhysicalStoreEnabled();
  const sidebarSections = getSidebarSections(isPhysicalStore);
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const collapsed =
    externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const canToggle = externalCollapsed === undefined;

  const storeTitle = me?.store || storeDetails?.name || "mel.iq";
  const displayName =
    me?.fullName || me?.name || me?.user?.name || "مستخدم ميل";
  const roleLabel = me?.role || me?.user?.role || "مدير النظام";
  const initials = getInitials(displayName);

  const handleLogout = () => {
    logoutMutation(
      {},
      {
        onSuccess: () => {
          toast.success("تم تسجيل الخروج بنجاح");
        },
        onSettled: () => {
          navigate("/login", { replace: true });
        },
      },
    );
  };

  return (
    <aside
      dir="rtl"
      className={cn(
        "relative flex h-full shrink-0 flex-col overflow-hidden border-l border-border/60 bg-card text-right transition-[width] duration-200",
        "dark:border-sidebar-border dark:bg-sidebar",
        collapsed ? "w-[76px]" : "w-[min(272px,88vw)] lg:w-[272px]",
        className,
      )}
    >
      {/* Soft purple glow behind header — dark only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden h-40 overflow-hidden dark:block"
      >
        <div className="absolute -top-16 left-1/2 size-40 -translate-x-1/2 rounded-full bg-violet-500/20 blur-[50px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-3 pb-2">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            {canToggle && (
              <button
                type="button"
                onClick={() => setInternalCollapsed((v) => !v)}
                className="hidden size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted/60 lg:flex dark:border-white/10 dark:hover:bg-white/5"
                aria-label="توسيع القائمة"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-sky-400 p-[2px]">
              <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-background">
                <SidebarStoreLogo storeLogoUrl={storeLogoUrl} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl border border-transparent bg-slate-50 px-2.5 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
            {/* RTL: logo on the right */}
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-violet-500 to-sky-400 p-[2px]">
              <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-white dark:bg-background">
                <SidebarStoreLogo storeLogoUrl={storeLogoUrl} />
              </div>
            </div>
            <div className="min-w-0 flex-1 text-right">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {storeTitle}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                نظام إدارة المتاجر
              </p>
            </div>
            {canToggle && (
              <button
                type="button"
                onClick={() => setInternalCollapsed((v) => !v)}
                className="hidden size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200/70 lg:flex dark:hover:bg-white/5"
                aria-label="طي القائمة"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          "custom-scrollbar relative z-10 flex-1 overflow-y-auto py-2",
          collapsed ? "space-y-4 px-2" : "space-y-5 px-3",
        )}
      >
        {sidebarSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-1.5 px-2 text-right text-[11px] font-medium tracking-wide text-slate-400 dark:text-slate-500">
                {section.title}
              </p>
            )}
            <div className={cn(collapsed ? "space-y-1.5" : "space-y-1")}>
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

      {/* Footer profile */}
      <div className="relative z-10 p-3 pt-1">
        {/* Soft glow above avatar — dark only */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-14 right-6 hidden size-16 rounded-full bg-sky-400/15 blur-[28px] dark:block"
        />

        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigate("/settings/store");
                onNavigate?.();
              }}
              title={displayName}
              className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-sky-400 text-xs font-bold text-white shadow-sm"
              aria-label="الملف الشخصي"
            >
              {initials}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="تسجيل الخروج"
              className="flex size-9 items-center justify-center rounded-xl text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
              aria-label="تسجيل الخروج"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex w-full items-center gap-2.5 rounded-2xl border border-transparent bg-slate-50 px-2.5 py-2.5 text-right transition-colors hover:bg-slate-100 dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
            >
              {/* RTL: avatar on the right */}
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-violet-500 to-sky-400 text-xs font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {displayName}
                </p>
                <p className="truncate text-[11px] text-slate-400">{roleLabel}</p>
              </div>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-slate-400 transition-transform",
                  profileOpen && "rotate-180",
                )}
              />
            </button>

            {profileOpen ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full flex-row items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <LogOut className="size-4" />
                <span>{isLoggingOut ? "جاري الخروج..." : "تسجيل الخروج"}</span>
              </button>
            ) : null}
          </div>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
