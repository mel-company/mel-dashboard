import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type DashedTagProps = {
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
  /** Optional leading label shown in blue (e.g. property name) */
  lead?: React.ReactNode;
};

export function DashedTag({
  children,
  onRemove,
  className,
  lead,
}: DashedTagProps) {
  return (
    <span
      dir="rtl"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1 text-xs",
        "border-slate-300 bg-white text-slate-700",
        "dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200",
        className,
      )}
    >
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="flex size-4 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-500 dark:hover:bg-rose-400"
          aria-label="إزالة"
        >
          <X className="size-2.5" strokeWidth={2.5} />
        </button>
      ) : null}
      {lead ? (
        <span className="font-semibold text-sky-500 dark:text-sky-400">
          {lead}
        </span>
      ) : null}
      {lead ? <span className="text-slate-300">|</span> : null}
      <span dir="auto">{children}</span>
    </span>
  );
}

export function AddedLabel({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "shrink-0 text-xs font-semibold text-violet-700 underline underline-offset-2 dark:text-violet-400",
        onClick && "hover:text-violet-900",
        className,
      )}
    >
      المضافة
    </Comp>
  );
}

const purpleAddBtn =
  "size-9 shrink-0 rounded-xl bg-violet-100 p-0 text-violet-600 shadow-none hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-200 dark:hover:bg-violet-500/30";

export function PurpleAddButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center transition-colors",
        purpleAddBtn,
      )}
      aria-label={label}
    >
      <Plus className="size-4" strokeWidth={2.5} />
    </button>
  );
}

export function ProductSectionCard({
  title,
  description,
  label,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  label?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5 dark:border-white/[0.06] dark:bg-[#0a0e27]",
        className,
      )}
    >
      <div dir="rtl" className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 text-right">
          <h2 className="text-right text-base font-bold text-[#1a2b5a] sm:text-lg dark:text-blue-100">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-xl text-right text-xs leading-relaxed text-slate-400">
              {description}
            </p>
          ) : null}
          {label ? (
            <p className="mt-1 text-right text-xs font-medium text-sky-500">
              {label}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
