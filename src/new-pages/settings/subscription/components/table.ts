/** Shared classes for the subscription page's plain tables. */
export const tableClass = "w-full text-sm";
export const headRowClass =
  "border-b border-slate-100 text-slate-500 dark:border-slate-800";
export const thClass = "py-2 text-right font-medium";
export const bodyClass = "divide-y divide-slate-100 dark:divide-slate-800";
export const labelCellClass =
  "py-2.5 pe-4 font-medium text-slate-900 dark:text-slate-100";
export const cellClass =
  "py-2.5 pe-4 tabular-nums text-slate-700 dark:text-slate-300";
export const primaryButtonClass =
  "rounded-full bg-linear-to-l from-[#b282ff] to-[#33c5ff] text-white hover:opacity-90";

export const formatDay = (value?: string | null) => {
  if (!value) return "—";
  const at = new Date(value);
  if (Number.isNaN(at.getTime())) return "—";
  return at.toLocaleDateString("ar-IQ-u-nu-latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
