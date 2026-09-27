import { HugeiconsIcon } from "@hugeicons/react";
import {
  InformationCircleIcon,
  LockIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import { cn } from "@/lib/utils";

type DomainPreviewProps = {
  /** Full host, already assembled — e.g. `example.mel.iq`. */
  host: string;
  placeholder?: string;
};

/** Removes any doubt about how the parts combine, which RTL alone cannot. */
export const DomainPreview = ({ host, placeholder }: DomainPreviewProps) => {
  const shown = host || placeholder || "";
  const empty = !host;

  return (
    <div className="flex h-14 items-center justify-end gap-2 rounded-2xl bg-slate-100 px-4 dark:bg-slate-900">
      <span
        dir="ltr"
        className={cn(
          "min-w-0 truncate text-[15px] font-medium",
          empty
            ? "text-slate-400 dark:text-slate-500"
            : "text-emerald-600 dark:text-emerald-400",
        )}
      >
        https://{shown}
      </span>
      <HugeiconsIcon
        icon={LockIcon}
        size={16}
        className={cn(
          "shrink-0",
          empty
            ? "text-slate-400 dark:text-slate-500"
            : "text-emerald-600 dark:text-emerald-400",
        )}
      />
    </div>
  );
};

type DomainNoteProps = {
  children: React.ReactNode;
  tone?: "info" | "warning";
};

export const DomainNote = ({ children, tone = "info" }: DomainNoteProps) => (
  <div
    className={cn(
      "flex items-start gap-2 rounded-2xl px-4 py-3 text-[13px] leading-relaxed",
      tone === "warning"
        ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
        : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400",
    )}
  >
    <span className="min-w-0 flex-1">{children}</span>
    <HugeiconsIcon
      icon={InformationCircleIcon}
      size={16}
      className="mt-0.5 shrink-0 opacity-70"
    />
  </div>
);
