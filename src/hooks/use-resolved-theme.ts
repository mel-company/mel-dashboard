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
