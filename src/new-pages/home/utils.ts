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
