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

/** Soft tint chips like Figma Alerts */
const colorMap = {
  danger: "bg-[#ff52521a] text-[#ff5252]",
  warning: "bg-[#ff9b3d1a] text-[#f57b00]",
  success: "bg-[#00dfa81a] text-[#00b88a]",
  purple: "bg-[#9a5cff1a] text-[#7d26f7]",
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
