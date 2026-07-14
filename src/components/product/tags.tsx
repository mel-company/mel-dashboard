import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DashedTagProps = {
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
};

export function DashedTag({ children, onRemove, className }: DashedTagProps) {
  return (
    <span
      dir="ltr"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#c5d0dc] bg-white px-2.5 py-1 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-300",
        className,
      )}
    >
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="flex size-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 hover:bg-violet-200 dark:bg-violet-900/50 dark:text-violet-300"
          aria-label="إزالة"
        >
          <X className="size-2.5" strokeWidth={2.5} />
        </button>
      ) : null}
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
        "rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-950",
        className,
      )}
    >
      <div
        dir="rtl"
        className="mb-3 flex items-start justify-between gap-3"
      >
        <div className="min-w-0 text-right">
          <h2 className="text-lg font-bold text-blue-950 dark:text-blue-100 text-right">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-xs text-slate-400 text-right">{description}</p>
          ) : null}
          {label ? (
            <p className="mt-2 text-xs font-medium text-slate-400 text-left">{label}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 text-left">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
