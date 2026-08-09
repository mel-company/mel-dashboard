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
              "w-full rounded-[1.25rem] border p-3.5 text-right transition-colors",
              /* Light mode cards */
              "border-slate-100 bg-[#f8f9fc]",
              /* Dark mode cards — neutral, matches app theme */
              "dark:border-slate-800 dark:bg-slate-950",
              "active:scale-[0.995]",
              !isRead && "ring-1 ring-sky-400/20 dark:ring-sky-500/20",
            )}
          >
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <NotificationTypeBadge meta={meta} />
              <span
                className="shrink-0 text-[11px] tabular-nums text-slate-400"
                dir="ltr"
              >
                {timePart} • {datePart}
              </span>
            </div>

            <h3 className="mb-1 text-[15px] leading-snug font-bold text-slate-900 dark:text-white">
              {notification.title || "بدون عنوان"}
            </h3>

            <p className="mb-3 text-[11px] text-slate-400 dark:text-slate-500">
              معرف الاشعارات:{" "}
              <span className="font-mono" dir="ltr">
                #{notification.id.slice(0, 8)}
              </span>
            </p>

            <div className="border-t border-slate-200/80 pt-3 dark:border-white/5">
              {entity ? (
                <p className="mb-1 text-sm font-medium text-sky-500">
                  {entity}
                </p>
              ) : null}
              <p className="line-clamp-2 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
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
