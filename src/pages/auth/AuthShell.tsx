import type { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import melLogo from "@/assets/imgs/logo/mel-logo.svg";
import { useTheme } from "@/components/theme-provider";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  className?: string;
};

/**
 * Shared chrome for /login and /otp.
 * Mel mark + title above the form; theme toggle pinned top-start.
 */
const AuthShell = ({
  children,
  eyebrow = "لوحة تحكم المتجر",
  title,
  description,
  className,
}: Props) => {
  const { theme, setTheme } = useTheme();
  const isDark = useResolvedTheme() === "dark";

  const toggleTheme = () => {
    if (theme === "system") setTheme(isDark ? "light" : "dark");
    else setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div
      dir="rtl"
      className={cn(
        "relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12",
        "bg-[#f4f7fb] text-slate-900 dark:bg-[#06091a] dark:text-[#e4e7fc]",
        className,
      )}
    >
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 55% at 90% -5%, rgba(0, 183, 255, 0.18), transparent 55%),
            radial-gradient(ellipse 60% 45% at 0% 100%, rgba(87, 51, 234, 0.12), transparent 50%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 80% 55% at 85% -10%, rgba(87, 51, 234, 0.45), transparent 55%),
            radial-gradient(ellipse 70% 50% at -5% 100%, rgba(0, 183, 255, 0.28), transparent 50%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0, 255, 248, 0.06), transparent 60%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.045] dark:opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          color: isDark ? "rgba(228,231,252,0.9)" : "rgba(26,43,90,0.55)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)",
        }}
      />

      {/* Theme toggle — top of page */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
        title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
        className={cn(
          "absolute top-4 z-20 flex h-11 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors",
          "start-4 sm:start-6 sm:top-6",
          "border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur",
          "hover:border-[#00b7ff]/40 hover:text-[#00b7ff]",
          "dark:border-white/10 dark:bg-[#12183b]/90 dark:text-[#a4b1fa] dark:hover:border-[#00b7ff]/40 dark:hover:text-[#33c5ff]",
        )}
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        <span className="hidden sm:inline">
          {isDark ? "فاتح" : "داكن"}
        </span>
      </button>

      <div className="relative z-10 w-full max-w-[400px]">
        <header className="mb-6 flex flex-col items-center text-center">
          <img
            src={melLogo}
            alt="Mel"
            className="mb-4 h-12 w-auto animate-[auth-mark-in_0.7s_ease-out_both] object-contain drop-shadow-[0_0_24px_rgba(0,183,255,0.3)] sm:h-14"
          />
          {eyebrow ? (
            <p className="mb-1.5 text-[11px] font-medium tracking-[0.16em] text-[#00b7ff] uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1
            className="text-[1.75rem] font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl"
            style={{ fontFamily: "var(--font-family-table)" }}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-[36ch] text-[13px] leading-relaxed text-slate-500 dark:text-[#a4b1fa] sm:text-sm">
              {description}
            </p>
          ) : null}
        </header>

        <div
          className={cn(
            "animate-[auth-panel-in_0.55s_ease-out_0.08s_both] rounded-[28px] border p-5 sm:p-6",
            "border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-28px_rgba(17,44,113,0.2)] backdrop-blur-xl",
            "dark:border-white/8 dark:bg-[#0a0e27]/85 dark:shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)]",
          )}
        >
          {children}
        </div>
      </div>

      <style>{`
        @keyframes auth-mark-in {
          from { opacity: 0; transform: translateY(10px) scale(0.96); }
          to { opacity: 1; transform: none; }
        }
        @keyframes auth-panel-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
};

export default AuthShell;
