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

/** Soft tint chips — Figma Light Alerts */
const colorMap = {
  danger:
    "bg-[rgba(255,8,8,0.08)] text-[#ff0808] dark:bg-[#ff52521a] dark:text-[#ff5252]",
  warning:
    "bg-[rgba(245,123,0,0.1)] text-[#f57b00] dark:bg-[#ff9b3d1a] dark:text-[#f57b00]",
  success:
    "bg-[rgba(0,184,138,0.1)] text-[#00b88a] dark:bg-[#00dfa81a] dark:text-[#00b88a]",
  purple:
    "bg-[rgba(125,38,247,0.08)] text-[#7d26f7] dark:bg-[#9a5cff1a] dark:text-[#b282ff]",
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
        "inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-[13px] font-medium whitespace-nowrap",
        colorMap[meta.color],
        className,
      )}
    >
      {meta.label}
      <Icon className="size-3.5 shrink-0" strokeWidth={2.25} />
    </span>
  );
};

export default NotificationTypeBadge;
