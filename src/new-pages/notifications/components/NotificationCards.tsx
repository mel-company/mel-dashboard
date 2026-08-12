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
              "w-full rounded-2xl border border-transparent bg-card p-4 text-right transition-colors",
              "active:scale-[0.995]",
              !isRead && "ring-1 ring-primary/20",
            )}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span
                className="shrink-0 text-[11px] tabular-nums text-muted-foreground"
                dir="ltr"
              >
                {timePart} • {datePart}
              </span>
              <NotificationTypeBadge meta={meta} />
            </div>

            <h3
              className={cn(
                "mb-1 text-[15px] leading-snug font-bold",
                isRead ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {notification.title || "بدون عنوان"}
            </h3>

            <p className="mb-3 text-[11px] text-muted-foreground">
              معرف الاشعارات:{" "}
              <span className="font-mono" dir="ltr">
                #{notification.id.slice(0, 8)}
              </span>
            </p>

            <div className="border-t border-border/60 pt-3">
              {entity ? (
                <p className="mb-1 text-[13px] font-semibold text-[#33c5ff]">
                  {entity}
                </p>
              ) : null}
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
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
