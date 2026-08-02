import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";

/** Resolves `system` theme to concrete `light` | `dark`. */
export function useResolvedTheme(): "light" | "dark" {
  const { theme } = useTheme();
  const [resolved, setResolved] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  );

  useEffect(() => {
    if (theme === "dark") {
      setResolved("dark");
      return;
    }
    if (theme === "light") {
      setResolved("light");
      return;
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setResolved(mq.matches ? "dark" : "light");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  return resolved;
}

export const LIGHT_MAP_TILES =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export const DARK_MAP_TILES =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
