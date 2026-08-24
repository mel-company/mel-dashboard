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
        "cursor-pointer border-b border-[#e7edf6] transition-colors hover:bg-[#f5f6fa] dark:border-white/[0.06] dark:hover:bg-white/[0.03]",
        !isRead && "bg-[#00b7ff]/[0.04] dark:bg-primary/5",
      )}
      onClick={() => onClick(notification)}
    >
      <TableCell className={cn(tdClass, "w-28")}>
        <span
          className="font-mono text-sm font-medium text-[#00b7ff] dark:text-[#33c5ff]"
          dir="ltr"
        >
          #{notification.id.slice(0, 8)}
        </span>
      </TableCell>
      <TableCell className={tdClass}>
        <p
          className={cn(
            "font-semibold",
            isRead
              ? "text-[#91a0b6] dark:text-muted-foreground"
              : "text-[#04111c] dark:text-foreground",
          )}
        >
          {notification.title || "بدون عنوان"}
        </p>
      </TableCell>
      <TableCell className={tdClass}>
        <div className="max-w-md space-y-0.5">
          {entity ? (
            <p className="text-sm font-medium text-[#00b7ff] underline underline-offset-2 dark:text-[#33c5ff]">
              {entity}
            </p>
          ) : null}
          <p className="line-clamp-2 text-sm text-[#6c809d] dark:text-muted-foreground">
            {detail}
          </p>
        </div>
      </TableCell>
      <TableCell className={tdClass}>
        <NotificationTypeBadge meta={typeMeta} />
      </TableCell>
      <TableCell className={cn(tdClass, "w-36")}>
        <div className="flex flex-col gap-0.5 tabular-nums" dir="ltr">
          <span className="text-sm font-medium text-[#3b4656] dark:text-foreground">
            {datePart}
          </span>
          <span className="text-xs text-[#91a0b6] dark:text-muted-foreground">
            {timePart}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default NotificationRow;
