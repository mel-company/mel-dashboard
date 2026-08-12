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
        "cursor-pointer border-b border-border/70 transition-colors hover:bg-muted/40",
        !isRead && "bg-primary/5",
      )}
      onClick={() => onClick(notification)}
    >
      <TableCell className={cn(tdClass, "w-28")}>
        <span
          className="font-mono text-sm font-medium text-[#33c5ff]"
          dir="ltr"
        >
          #{notification.id.slice(0, 8)}
        </span>
      </TableCell>
      <TableCell className={tdClass}>
        <p
          className={cn(
            "font-semibold",
            isRead ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {notification.title || "بدون عنوان"}
        </p>
      </TableCell>
      <TableCell className={tdClass}>
        <div className="max-w-md space-y-0.5">
          {entity ? (
            <p className="text-sm font-medium text-[#33c5ff] underline underline-offset-2">
              {entity}
            </p>
          ) : null}
          <p className="line-clamp-2 text-sm text-muted-foreground">{detail}</p>
        </div>
      </TableCell>
      <TableCell className={tdClass}>
        <NotificationTypeBadge meta={typeMeta} />
      </TableCell>
      <TableCell className={cn(tdClass, "w-36")}>
        <div className="flex flex-col gap-0.5 tabular-nums" dir="ltr">
          <span className="text-sm font-medium text-foreground">{datePart}</span>
          <span className="text-xs text-muted-foreground">{timePart}</span>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default NotificationRow;
