export const formatIQD = (value: number) =>
  `${Math.round(value).toLocaleString("ar-IQ")} د.ع`;

export const formatCompactIQD = (value: number) => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B د.ع`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M د.ع`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K د.ع`;
  }
  return formatIQD(value);
};

export const AR_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export const AR_WEEKDAYS = [
  "السبت",
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];

/** Matches `Date#getDay()` order used by the dashboard API bars array. */
export const AR_WEEKDAYS_SUNDAY_FIRST = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const EN_MONTH_TO_AR: Record<string, string> = {
  Jan: "يناير",
  Feb: "فبراير",
  Mar: "مارس",
  Apr: "أبريل",
  May: "مايو",
  Jun: "يونيو",
  Jul: "يوليو",
  Aug: "أغسطس",
  Sep: "سبتمبر",
  Oct: "أكتوبر",
  Nov: "نوفمبر",
  Dec: "ديسمبر",
};

export const toArabicMonth = (month: string) =>
  EN_MONTH_TO_AR[month] ?? month;

export type DashboardPeriod =
  | "7d"
  | "30d"
  | "this_month"
  | "last_month"
  | "3m"
  | "12m";

export const DASHBOARD_PERIOD_OPTIONS: {
  value: DashboardPeriod;
  label: string;
}[] = [
  { value: "7d", label: "آخر 7 أيام" },
  { value: "30d", label: "آخر 30 يوم" },
  { value: "this_month", label: "هذا الشهر" },
  { value: "last_month", label: "الشهر الماضي" },
  { value: "3m", label: "آخر 3 أشهر" },
  { value: "12m", label: "آخر 12 شهر" },
];

const pad2 = (n: number) => String(n).padStart(2, "0");

export function formatDateParam(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Calendar month to date — overrides backend default (last 30 days). */
export function getCurrentMonthDateRange(now = new Date()) {
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    from: formatDateParam(from),
    to: formatDateParam(now),
  };
}

export function resolveDashboardDateRange(
  period: DashboardPeriod,
  now = new Date(),
): { from: string; to: string } {
  const to = formatDateParam(now);

  if (period === "this_month") {
    return getCurrentMonthDateRange(now);
  }

  if (period === "last_month") {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: formatDateParam(from), to: formatDateParam(end) };
  }

  const days =
    period === "7d" ? 7 : period === "30d" ? 30 : period === "3m" ? 90 : 365;

  const from = new Date(now);
  from.setDate(from.getDate() - (days - 1));
  return { from: formatDateParam(from), to };
}

export const CHART_COLORS = {
  cyan: "#00B7FF",
  purple: "#9139C4",
  purpleSoft: "#B282FF",
  green: "#00DFA8",
  greenLight: "#00B88A",
  orange: "#F97316",
  red: "#FF6B6B",
  pink: "#EC4899",
  muted: "#6C809D",
};

export const PAYMENT_METHOD_COLORS = [
  CHART_COLORS.cyan,
  CHART_COLORS.orange,
  CHART_COLORS.purple,
  CHART_COLORS.green,
  CHART_COLORS.pink,
  CHART_COLORS.muted,
] as const;

export function getChartTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  const styles = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;

  return {
    isDark,
    tick: token("--muted-foreground", isDark ? "#A4B1FA" : "#6C809D"),
    grid: token("--border", isDark ? "#12183B" : "#E7EDF6"),
    tooltipBg: token("--card", isDark ? "#0A0E27" : "#FFFFFF"),
    tooltipBorder: token("--border", isDark ? "#12183B" : "#E7EDF6"),
    tooltipText: token("--foreground", isDark ? "#F0F2FF" : "#04111C"),
  };
}
