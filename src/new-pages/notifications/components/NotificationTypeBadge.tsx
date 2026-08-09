import {
  AlertTriangle,
  Check,
  HelpCircle,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationTypeMeta } from "../utils";

const iconMap = {
  warning: AlertTriangle,
  alert: HelpCircle,
  new: Check,
  order: MessageCircle,
} as const;

/** Soft pastel light chips + solid dark chips */
const colorMap = {
  danger:
    "bg-rose-100 text-rose-600 dark:bg-rose-500 dark:text-white",
  warning:
    "bg-orange-100 text-orange-600 dark:bg-orange-500 dark:text-white",
  success:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-500 dark:text-white",
  purple:
    "bg-violet-100 text-violet-600 dark:bg-violet-500 dark:text-white",
} as const;

type NotificationTypeBadgeProps = {
  meta: NotificationTypeMeta;
  className?: string;
};

const NotificationTypeBadge = ({
  meta,
  className,
}: NotificationTypeBadgeProps) => {
  const Icon = iconMap[meta.key];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap",
        colorMap[meta.color],
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" strokeWidth={2.5} />
      {meta.label}
    </span>
  );
};

export default NotificationTypeBadge;
