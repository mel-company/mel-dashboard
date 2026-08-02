import { TableCell, TableRow } from "@/components/ui/table";
import Badge from "@/components/table/badge";
import { cn } from "@/lib/utils";
import type { NotificationListItem } from "@/api/types/notification";
import {
  formatNotificationDate,
  getNotificationTypeMeta,
  isNotificationRead,
} from "../utils";

type NotificationRowProps = {
  notification: NotificationListItem;
  rowIndex: number;
  onClick: (notification: NotificationListItem) => void;
};

const NotificationRow = ({
  notification,
  rowIndex,
  onClick,
}: NotificationRowProps) => {
  const tdClass = "whitespace-normal px-4 py-3.5 text-right align-middle";
  const typeMeta = getNotificationTypeMeta(notification);
  const isRead = isNotificationRead(notification);

  return (
    <TableRow
      className={cn(
        "cursor-pointer border-b border-slate-100 hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-900/80",
        !isRead && "bg-sky-50/40 dark:bg-sky-500/10",
      )}
      onClick={() => onClick(notification)}
    >
      <TableCell className={cn(tdClass, "w-14 text-muted-foreground")}>
        <span className="text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300">
          {String(rowIndex + 1).padStart(2, "0")}
        </span>
      </TableCell>
      <TableCell className={cn(tdClass, "w-28")}>
        <span className="font-mono text-sm font-medium text-slate-600 dark:text-slate-400" dir="ltr">
          #{notification.id.slice(0, 8)}
        </span>
      </TableCell>
      <TableCell className={tdClass}>
        <p className="font-semibold text-slate-900 dark:text-slate-100">
          {notification.title || "بدون عنوان"}
        </p>
      </TableCell>
      <TableCell className={tdClass}>
        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
          {notification.message || "—"}
        </p>
      </TableCell>
      <TableCell className={tdClass}>
        <Badge color={typeMeta.color}>{typeMeta.label}</Badge>
      </TableCell>
      <TableCell className={cn(tdClass, "tabular-nums text-sm text-slate-600 dark:text-slate-400")} dir="ltr">
        {formatNotificationDate(notification.createdAt)}
      </TableCell>
    </TableRow>
  );
};

export default NotificationRow;
