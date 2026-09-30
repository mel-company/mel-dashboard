import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Figma wraps every page's content in one elevated rounded panel — the
 * `bg-main` frame: "Colors/Shiny White" (#12183b in dark), inset from the page
 * gutter with a 28px radius and its own padding. Only three pages carried it,
 * so the rest read as a different product: their cards sat straight on the
 * page background with nothing holding them together.
 *
 * Pages keep control of their own vertical rhythm via `className`
 * (e.g. `space-y-4 sm:space-y-6`); the panel only owns the chrome.
 */
const PagePanel = ({
  children,
  className,
  lang,
}: {
  children: ReactNode;
  className?: string;
  lang?: string;
}) => (
  <div
    dir="rtl"
    lang={lang}
    className={cn(
      "min-h-full rounded-[28px] bg-surface p-3 sm:p-4 lg:p-5",
      className,
    )}
  >
    {children}
  </div>
);

export default PagePanel;
