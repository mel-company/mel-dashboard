/**
 * Shared responsive class tokens for the dashboard shell.
 *
 * Stages:
 * - < lg (1024): phone + tablet → MobileTopBar, drawer sidebar, card lists
 * - lg–xl (1024–1279): laptop → fixed sidebar + TitleBar, still card lists
 * - xl+ (1280+): desktop → tables / dense grids
 */

/** Show only while MobileTopBar is visible (< lg) */
export const mobileChrome = "lg:hidden";

/** Show when MobileTopBar is gone (lg+) — TitleBar, desktop page headers */
export const desktopChrome = "hidden lg:block";

/** Card / mobile list layout — keep through tablet + small laptop */
export const cardsLayout = "xl:hidden";

/** Table / dense desktop list — only when content width is comfortable */
export const tablesLayout = "hidden xl:block";

/** Stats: 1 → 2 → 4 columns across sizes */
export const statsGrid4 =
  "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4";

/** Stats: 1 → 2 → 3 */
export const statsGrid3 =
  "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3";

/** Soft page shell padding that scales with viewport */
export const pageShell =
  "min-h-full w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-5 lg:space-y-6";
