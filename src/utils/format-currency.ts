/** Latin digits + English thousands separators: 1,000 / 1,000.5 */
const IQD_NUMBER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

/**
 * Formats a number with English grouping (e.g. 1,250,000).
 * Use for money amounts only — not for counts/quantities.
 */
export function formatNumber(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return "0";
  return IQD_NUMBER.format(n);
}

/**
 * Formats an IQD amount: `1,250,000 د.ع`
 */
export function formatCurrency(
  value: number | null | undefined,
  fallback = "—",
): string {
  if (value == null || Number.isNaN(Number(value))) return fallback;
  return `${formatNumber(value)} د.ع`;
}
