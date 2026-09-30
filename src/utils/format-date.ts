/**
 * One date format for the whole dashboard: `02/08/2026` over `09:15 AM`,
 * which is what Figma draws on every table. Orders already did this; tickets
 * rendered a long Arabic date ("30 أيلول، 2026") and the two disagreed.
 */
export function formatDateParts(dateString?: string | null): {
  date: string;
  time: string;
} {
  if (!dateString) return { date: "—", time: "" };
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return { date: "—", time: "" };

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { date: `${day}/${month}/${year}`, time };
}

/** Single-line variant: `02/08/2026 · 09:15 AM`. */
export function formatDateTime(dateString?: string | null): string {
  const { date, time } = formatDateParts(dateString);
  if (date === "—") return date;
  return time ? `${date} · ${time}` : date;
}
