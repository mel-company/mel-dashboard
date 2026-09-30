import type { ReactNode } from "react";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import NotificationTableHeader from "./NotificationTableHeader";
import NotificationRow from "./NotificationRow";
import NotificationCards from "./NotificationCards";
import type { NotificationListItem } from "@/api/types/notification";
import { cn } from "@/lib/utils";
import {
  useTablePagination,
  byCreatedAt,
  text,
  time,
} from "@/hooks/use-table-pagination";

const NOTIFICATION_COLUMNS = {
  id: (n: unknown) => text(n, "id"),
  title: (n: unknown) => text(n, "title"),
  description: (n: unknown) => text(n, "message", "body", "description"),
  type: (n: unknown) => text(n, "type"),
  date: (n: unknown) => time(n, "createdAt", "created_at"),
};

type NotificationTableProps = {
  notifications: NotificationListItem[];
  totalAvailable: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  onRowClick: (notification: NotificationListItem) => void;
  toolbar?: ReactNode;
};

const NotificationTable = ({
  notifications,
  totalAvailable,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onRowClick,
  toolbar,
}: NotificationTableProps) => {
  const { pageItems: paginatedNotifications, paginationProps, sort } =
    useTablePagination({
      items: notifications,
      getSortValue: byCreatedAt,
      columns: NOTIFICATION_COLUMNS,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
    });

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-[24px] border border-[#e7edf6] bg-white p-3 shadow-[0_2px_12px_rgba(17,44,113,0.05)] sm:p-4",
        "dark:border-white/[0.06] dark:bg-[#0a0e27] dark:shadow-none",
      )}
    >
      <div className="mb-4 flex flex-col gap-4 sm:mb-5 md:flex-row md:items-center md:justify-between">
        {/* RTL: the first child sits rightmost — Figma puts the list title on
            the right and the search/filter controls on the left. */}
        <div className="order-1 text-right">
          <h2 className="text-base font-normal text-[#3b4656] sm:text-[20px] dark:text-foreground">
            جميع الاشعارات
          </h2>
          <p className="mt-0.5 text-xs text-[#6c809d] sm:text-sm dark:text-muted-foreground">
            أجمالي العناصر المتاحة{" "}
            <span className="font-bold text-[#3b4656] dark:text-foreground">
              {totalAvailable}
            </span>
          </p>
        </div>
        {toolbar ? (
          <div className="order-2 hidden lg:block">{toolbar}</div>
        ) : null}
      </div>

      <NotificationCards
        notifications={paginatedNotifications}
        onCardClick={onRowClick}
      />

      <div className="hidden overflow-x-auto xl:block">
        <Table>
          <NotificationTableHeader sort={sort} />
          <TableBody>
            {paginatedNotifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onClick={onRowClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 border-t border-[#e7edf6] pt-4 dark:border-white/[0.06]">
        <Pagination {...paginationProps} />
      </div>
    </div>
  );
};

export default NotificationTable;
