/** Arabic names with Latin digits (123 not ١٢٣). Use for dates. */
export const AR_LATN_LOCALE = "ar-IQ-u-nu-latn";

/** Convert Eastern Arabic / Persian digits to Latin 0-9. */
export function toLatinDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/** Keep only a decimal number with Latin digits (for inputs). */
export function sanitizeDecimalInput(raw: string): string {
  const latin = toLatinDigits(raw).replace(/[^\d.]/g, "");
  const parts = latin.split(".");
  if (parts.length <= 1) return latin;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

/** Latin digits + English thousands separators: 1,000 / 1,000.5 */
const IQD_NUMBER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

/** Latin digits, no grouping — for counts/quantities only. */
const COUNT_NUMBER = new Intl.NumberFormat("en-US", {
  useGrouping: false,
  maximumFractionDigits: 0,
});

/**
 * Formats a count/quantity with Latin digits and no thousands commas.
 */
export function formatCount(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return "0";
  return COUNT_NUMBER.format(n);
}

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
