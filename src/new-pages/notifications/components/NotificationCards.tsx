import { cn } from "@/lib/utils";
import type { NotificationListItem } from "@/api/types/notification";
import {
  formatNotificationDateParts,
  getNotificationTypeMeta,
  isNotificationRead,
  splitNotificationMessage,
} from "../utils";
import NotificationTypeBadge from "./NotificationTypeBadge";

type NotificationCardsProps = {
  notifications: NotificationListItem[];
  onCardClick: (notification: NotificationListItem) => void;
};

const NotificationCards = ({
  notifications,
  onCardClick,
}: NotificationCardsProps) => {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {notifications.map((notification) => {
        const meta = getNotificationTypeMeta(notification);
        const isRead = isNotificationRead(notification);
        const { datePart, timePart } = formatNotificationDateParts(
          notification.createdAt,
        );
        const { entity, detail } = splitNotificationMessage(
          notification.message,
        );

        return (
          <button
            key={notification.id}
            type="button"
            onClick={() => onCardClick(notification)}
            className={cn(
              "w-full rounded-[18px] border border-[#e7edf6] bg-white p-4 text-right shadow-[0_2px_12px_rgba(17,44,113,0.04)] transition-colors",
              "active:scale-[0.995] dark:border-white/[0.06] dark:bg-[#0a0e27] dark:shadow-none",
              !isRead && "ring-1 ring-[#00b7ff]/20",
            )}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <NotificationTypeBadge meta={meta} />
              <span
                className="shrink-0 text-[11px] tabular-nums text-[#91a0b6] dark:text-muted-foreground"
                dir="ltr"
              >
                {datePart}
                <span className="mx-1">•</span>
                {timePart}
              </span>
            </div>

            <h3
              className={cn(
                "mb-1 text-[15px] leading-snug font-bold",
                isRead
                  ? "text-[#91a0b6] dark:text-muted-foreground"
                  : "text-[#04111c] dark:text-foreground",
              )}
            >
              {notification.title || "بدون عنوان"}
            </h3>

            <p className="mb-3 text-[11px] text-[#6c809d] dark:text-muted-foreground">
              معرف الاشعارات:{" "}
              <span
                className="font-mono text-[#00b7ff] dark:text-[#33c5ff]"
                dir="ltr"
              >
                #{notification.id.slice(0, 8)}
              </span>
            </p>

            <div className="border-t border-[#e7edf6] pt-3 dark:border-white/[0.06]">
              {entity ? (
                <p className="mb-1 text-[13px] font-semibold text-[#00b7ff] dark:text-[#33c5ff]">
                  {entity}
                </p>
              ) : null}
              <p className="line-clamp-2 text-xs leading-relaxed text-[#6c809d] dark:text-muted-foreground">
                {detail}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default NotificationCards;
