import { Moon, Sparkles, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { cn } from "@/lib/utils";

/**
 * The small vertical capsule Figma floats against the far edge of every web
 * frame: an assistant button and a theme control. Before this the only theme
 * control on desktop lived inside Settings — `TopBar`, the one component that
 * mounted <ThemeToggle /> elsewhere, was never imported by anything.
 */
const FloatingRail = ({ onAssistantClick }: { onAssistantClick?: () => void }) => {
  const { theme, setTheme } = useTheme();
  const isDark = useResolvedTheme() === "dark";

  const toggleTheme = () => {
    if (theme === "system") setTheme(isDark ? "light" : "dark");
    else setTheme(theme === "dark" ? "light" : "dark");
  };

  const buttonClass = cn(
    "flex size-9 items-center justify-center rounded-full transition-colors",
    "text-[#3b4656] hover:bg-[#00b7ff]/10 hover:text-[#00b7ff]",
    "dark:text-[#a4b1fa] dark:hover:bg-white/8 dark:hover:text-[#33c5ff]",
  );

  return (
    <div
      className={cn(
        "pointer-events-auto fixed left-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-1 rounded-full p-1.5 lg:flex",
        "border border-[#e7edf6] bg-white/90 shadow-[0_8px_24px_rgba(17,44,113,0.08)] backdrop-blur",
        "dark:border-white/[0.08] dark:bg-[#12183b]/90 dark:shadow-none",
      )}
    >
      {onAssistantClick ? (
        <button
          type="button"
          onClick={onAssistantClick}
          className={buttonClass}
          aria-label="المساعد الذكي"
          title="المساعد الذكي"
        >
          <Sparkles className="size-4" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={toggleTheme}
        className={buttonClass}
        aria-label={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
        title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
    </div>
  );
};

export default FloatingRail;
