import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { NotificationListItem } from "@/api/types/notification";
import {
  formatNotificationDateParts,
  getNotificationTypeMeta,
  isNotificationRead,
  splitNotificationMessage,
} from "../utils";
import NotificationTypeBadge from "./NotificationTypeBadge";

type NotificationRowProps = {
  notification: NotificationListItem;
  onClick: (notification: NotificationListItem) => void;
};

const NotificationRow = ({ notification, onClick }: NotificationRowProps) => {
  const tdClass = "whitespace-normal px-4 py-4 text-right align-middle";
  const typeMeta = getNotificationTypeMeta(notification);
  const isRead = isNotificationRead(notification);
  const { datePart, timePart } = formatNotificationDateParts(
    notification.createdAt,
  );
  const { entity, detail } = splitNotificationMessage(notification.message);

  return (
    <TableRow
      className={cn(
        "cursor-pointer border-b border-slate-100/80 transition-colors hover:bg-slate-50/80 dark:border-white/5 dark:hover:bg-white/[0.03]",
        !isRead && "bg-sky-50/50 dark:bg-sky-500/[0.07]",
      )}
      onClick={() => onClick(notification)}
    >
      <TableCell className={cn(tdClass, "w-28")}>
        <span
          className="font-mono text-sm font-medium text-slate-500 dark:text-slate-400"
          dir="ltr"
        >
          #{notification.id.slice(0, 8)}
        </span>
      </TableCell>
      <TableCell className={tdClass}>
        <p className="font-semibold text-slate-900 dark:text-slate-50">
          {notification.title || "بدون عنوان"}
        </p>
      </TableCell>
      <TableCell className={tdClass}>
        <div className="max-w-md space-y-0.5">
          {entity ? (
            <p className="text-sm font-medium text-sky-600 underline underline-offset-2 dark:text-sky-400">
              {entity}
            </p>
          ) : null}
          <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
            {detail}
          </p>
        </div>
      </TableCell>
      <TableCell className={tdClass}>
        <NotificationTypeBadge meta={typeMeta} />
      </TableCell>
      <TableCell className={cn(tdClass, "w-36")}>
        <div className="flex flex-col gap-0.5 tabular-nums" dir="ltr">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {datePart}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {timePart}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default NotificationRow;
