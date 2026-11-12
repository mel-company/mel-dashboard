import { useEffect, useRef, useState } from "react";
import { Keyboard, Mic, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { cn } from "@/lib/utils";

const TAMIMA_MARK = "/images/bird-design.gif";

export type TamimaEntryMode = "voice" | "text";

/** Mount points for docked Tamima (same column as rail — above theme). */
export const TAMIMA_DOCK_SLOT_ID = "tamima-dock-slot";
export const TAMIMA_DOCK_ASIDE_ID = "tamima-dock-aside";

/**
 * Far-edge rail: Tamima mascot (opens صوت / كتابة) above light/dark.
 */
const FloatingRail = ({
  onAssistantModeSelect,
  onTamimaTap,
  assistantOpen = false,
  hideTamima = false,
}: {
  onAssistantModeSelect?: (mode: TamimaEntryMode) => void;
  /** When set (e.g. voice docked), bird tap expands instead of mode menu. */
  onTamimaTap?: () => void;
  assistantOpen?: boolean;
  /** Voice dock fills the bird slot via portal — keeps theme below. */
  hideTamima?: boolean;
}) => {
  const { theme, setTheme } = useTheme();
  const isDark = useResolvedTheme() === "dark";
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    if (theme === "system") setTheme(isDark ? "light" : "dark");
    else setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    if (assistantOpen) setMenuOpen(false);
  }, [assistantOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const pickMode = (mode: TamimaEntryMode) => {
    setMenuOpen(false);
    onAssistantModeSelect?.(mode);
  };

  const themeButtonClass = cn(
    "flex size-9 items-center justify-center rounded-full transition-colors",
    "text-[#3b4656] hover:bg-[#00b7ff]/10 hover:text-[#00b7ff]",
    "dark:text-[#a4b1fa] dark:hover:bg-white/8 dark:hover:text-[#33c5ff]",
  );

  const modeButtonClass = cn(
    "flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors",
    "border border-[#e7edf6] bg-white/95 text-[#3b4656] shadow-sm",
    "hover:border-[#33c5ff]/40 hover:bg-[#00b7ff]/8 hover:text-[#008fc7]",
    "dark:border-white/8 dark:bg-[#12183b]/95 dark:text-[#a4b1fa]",
    "dark:hover:bg-white/8 dark:hover:text-[#33c5ff]",
  );

  return (
    <div
      ref={rootRef}
      className={cn(
        // Slightly above vertical center; bird + theme stay one column (no overlap).
        "pointer-events-auto fixed left-3 top-[46%] z-30 flex -translate-y-1/2 flex-col items-center gap-2",
      )}
    >
      {onAssistantModeSelect ? (
        hideTamima ? (
          <div className="relative size-14 shrink-0">
            <div id={TAMIMA_DOCK_SLOT_ID} className="size-14" />
            {/* Physical left rail → panel must open to the right (into the page),
                not `start-full` which flips under RTL and covers the bird. */}
            <div
              id={TAMIMA_DOCK_ASIDE_ID}
              className="absolute left-full top-0 z-40 ml-2"
            />
          </div>
        ) : (
          <div className="relative flex flex-col items-center gap-2">
            {menuOpen ? (
              <div
                className="absolute left-full top-1/2 z-10 ms-2 flex -translate-y-1/2 flex-col gap-1.5"
                role="menu"
                aria-label="طريقة التواصل مع تميمة"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => pickMode("voice")}
                  className={modeButtonClass}
                >
                  <Mic className="size-3.5 shrink-0" />
                  صوت
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => pickMode("text")}
                  className={modeButtonClass}
                >
                  <Keyboard className="size-3.5 shrink-0" />
                  كتابة
                </button>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                if (onTamimaTap) {
                  setMenuOpen(false);
                  onTamimaTap();
                  return;
                }
                if (assistantOpen) {
                  setMenuOpen(false);
                  return;
                }
                setMenuOpen((open) => !open);
              }}
              className={cn(
                "group relative flex size-14 items-center justify-center rounded-full transition-transform",
                "border border-[#e7edf6] bg-white/95 shadow-[0_8px_24px_rgba(17,44,113,0.12)] backdrop-blur",
                "hover:scale-105 dark:border-white/8 dark:bg-[#12183b]/95",
                (assistantOpen || menuOpen) &&
                  "ring-2 ring-[#33c5ff]/50 ring-offset-2 ring-offset-background",
              )}
              aria-label="تميمة"
              title="تميمة"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <img
                src={TAMIMA_MARK}
                alt=""
                aria-hidden
                className="size-11 object-contain drop-shadow-sm"
                draggable={false}
              />
              <span className="sr-only">تميمة</span>
            </button>
          </div>
        )
      ) : null}

      <div
        className={cn(
          "flex flex-col gap-1 rounded-full p-1.5",
          "border border-[#e7edf6] bg-white/90 shadow-[0_8px_24px_rgba(17,44,113,0.08)] backdrop-blur",
          "dark:border-white/8 dark:bg-[#12183b]/90 dark:shadow-none",
        )}
      >
        <button
          type="button"
          onClick={toggleTheme}
          className={themeButtonClass}
          aria-label={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
          title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>
    </div>
  );
};

export default FloatingRail;
