/* eslint-disable react-hooks/set-state-in-effect */
import { Link, useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MenuTwoLineIcon,
  Notification01Icon,
  SparklesIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import { useEffect, useState } from "react";
import melLogo from "@/assets/imgs/logo/mel-logo.svg";
import { useTheme } from "@/components/theme-provider";
import { useMe } from "@/api/wrappers/auth.wrappers";
import { usePage } from "@/hooks/pages";
import { cn } from "@/lib/utils";

type MobileTopBarProps = {
  className?: string;
  onMenuClick?: () => void;
};

const PAGE_SUBTITLES: Record<string, string> = {
  "/": "يمكنك مراقبة جميع نشاطاتك في واجهة واحدة",
  "/notifications": "تمتلك إشعارات جديدة في قائمة الاشعارات",
  "/orders": "تابع حالة طلباتك وإدارة المبيعات",
  "/categories": "تمتلك حركات جديدة في قائمة الفئات",
  "/customers": "أفضل عملائك في مكان واحد",
  "/settings": "خصص إعدادات متجرك",
};

const actionBtnClass =
  "flex size-12 shrink-0 items-center justify-center rounded-[14px] text-foreground transition-colors active:bg-muted";

const MobileTopBar = ({ className, onMenuClick }: MobileTopBarProps) => {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const { currentPage, pathname } = usePage();
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const unreadCount = me?.notificationsCount || 0;

  useEffect(() => {
    if (theme === "dark") {
      setIsDark(true);
      return;
    }
    if (theme === "light") {
      setIsDark(false);
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(media.matches);
    const onChange = () => setIsDark(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("light");
    else {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setTheme(systemDark ? "light" : "dark");
    }
  };

  const title = currentPage?.label || me?.store || "لوحة التحكم";
  const matchedSubtitleKey =
    pathname in PAGE_SUBTITLES
      ? pathname
      : Object.keys(PAGE_SUBTITLES).find(
          (key) => key !== "/" && pathname.startsWith(key),
        );
  const subtitle =
    (matchedSubtitleKey ? PAGE_SUBTITLES[matchedSubtitleKey] : undefined) ??
    (me?.store ? me.store : "يمكنك مراقبة جميع نشاطاتك في واجهة واحدة");

  return (
    <header
      className={cn(
        "sticky top-0 z-30 space-y-3 bg-background/95 px-3 pb-2 backdrop-blur-md lg:hidden",
        "pt-[max(0.5rem,env(safe-area-inset-top))]",
        className,
      )}
    >
      {/* Figma: AI left | Logo | Menu right — RTL: Menu first, then Logo, then AI */}
      <div className="flex items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={onMenuClick}
          className={actionBtnClass}
          aria-label="القائمة"
        >
          <HugeiconsIcon icon={MenuTwoLineIcon} size={24} strokeWidth={1.5} />
        </button>

        <Link
          to="/"
          className="flex size-[42px] shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#b657ff] to-[#00bfff] p-2 shadow-[0_8px_24px_rgba(0,183,255,0.25)]"
          aria-label="الصفحة الرئيسية"
        >
          <img
            src={melLogo}
            alt="mel.iq"
            className="size-full object-contain brightness-0 invert"
          />
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          className={actionBtnClass}
          aria-label={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
          title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
        >
          <HugeiconsIcon icon={SparklesIcon} size={24} strokeWidth={1.5} />
          <span className="sr-only">تبديل الوضع</span>
        </button>
      </div>

      {/* Page Title — Setar 18/14 like Figma; icon on the right */}
      <div className="flex items-center gap-2 px-0.5">
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="relative flex size-11 shrink-0 items-center justify-center rounded-xl text-foreground transition-colors active:bg-muted"
          aria-label="الإشعارات"
        >
          <HugeiconsIcon
            icon={Notification01Icon}
            size={24}
            strokeWidth={1.5}
          />
          {unreadCount > 0 && (
            <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-[#00dfa8] ring-2 ring-background" />
          )}
        </button>

        <div className="min-w-0 flex-1 text-right">
          <h1
            className="truncate text-[18px] font-normal leading-[25.5px] text-foreground"
            style={{ fontFamily: '"Setar XS", var(--font-family)' }}
          >
            {title}
          </h1>
          <p
            className="truncate text-[14px] font-normal leading-5 text-muted-foreground"
            style={{ fontFamily: '"Setar XS", var(--font-family)' }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </header>
  );
};

export default MobileTopBar;
