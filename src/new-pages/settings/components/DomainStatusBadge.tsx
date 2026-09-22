import { cn } from "@/lib/utils";
import type { CustomHostnameStatus } from "@/api/endpoints/domain.endpoints";

const STATUS_STYLES: Record<
  CustomHostnameStatus,
  { label: string; className: string }
> = {
  active: {
    label: "مفعل",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  pending: {
    label: "قيد التحقق",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  },
  failed: {
    label: "فشل",
    className: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
  },
};

type DomainStatusBadgeProps = {
  status: CustomHostnameStatus | string | null | undefined;
  className?: string;
};

const DomainStatusBadge = ({ status, className }: DomainStatusBadgeProps) => {
  const style =
    STATUS_STYLES[(status as CustomHostnameStatus) ?? "pending"] ??
    STATUS_STYLES.pending;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium",
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  );
};

export default DomainStatusBadge;
