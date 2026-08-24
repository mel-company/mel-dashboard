import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import NotificationTableHeader from "./NotificationTableHeader";
import NotificationRow from "./NotificationRow";
import NotificationCards from "./NotificationCards";
import type { NotificationListItem } from "@/api/types/notification";
import { cn } from "@/lib/utils";

type SortOrder = "desc" | "asc";

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
  const [activePage, setActivePage] = useState(1);
  const [viewCount, setViewCount] = useState(10);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedNotifications = useMemo(() => {
    const list = [...notifications];
    list.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
    });
    return list;
  }, [notifications, sortOrder]);

  const totalPages = Math.ceil(sortedNotifications.length / viewCount) || 1;

  const handlePageChange = (page: number) => {
    setActivePage(page);
  };

  const handleViewCountChange = (count: number) => {
    setViewCount(count);
    setActivePage(1);
  };

  const startIndex = (activePage - 1) * viewCount;
  const paginatedNotifications = sortedNotifications.slice(
    startIndex,
    startIndex + viewCount,
  );

  const needsMoreData =
    activePage * viewCount > notifications.length && hasNextPage;

  useEffect(() => {
    if (needsMoreData && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [needsMoreData, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (activePage > totalPages) {
      setActivePage(totalPages);
    }
  }, [activePage, totalPages]);

  useEffect(() => {
    setActivePage(1);
  }, [sortOrder]);

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-[24px] border border-[#e7edf6] bg-white p-3 shadow-[0_2px_12px_rgba(17,44,113,0.05)] sm:p-4",
        "dark:border-white/[0.06] dark:bg-[#0a0e27] dark:shadow-none",
      )}
    >
      <div className="mb-4 flex flex-col gap-4 sm:mb-5 md:flex-row md:items-center md:justify-between">
        <div className="order-1 text-right md:order-2">
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
          <div className="order-2 hidden md:order-1 md:block">{toolbar}</div>
        ) : null}
      </div>

      <NotificationCards
        notifications={paginatedNotifications}
        onCardClick={onRowClick}
      />

      <div className="hidden overflow-x-auto md:block">
        <Table>
          <NotificationTableHeader />
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

      <div className="mt-4 space-y-3 border-t border-[#e7edf6] pt-4 dark:border-white/[0.06] md:block">
        <div className="hidden flex-wrap items-center justify-end gap-3 text-sm md:flex">
          <select
            className="rounded-lg border border-[rgba(125,38,247,0.15)] bg-transparent px-3 py-1.5 font-bold text-[#7d26f7] dark:border-[#9a5cff]/20 dark:text-[#b282ff]"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            aria-label="الترتيب"
          >
            <option value="desc">تنازلي</option>
            <option value="asc">تصاعدي</option>
          </select>
          <span className="text-[#6c809d] dark:text-muted-foreground">
            مرتبة بشكل
          </span>
        </div>

        <Pagination
          totalPages={
            hasNextPage ? Math.max(totalPages, activePage + 1) : totalPages
          }
          activePage={activePage}
          viewCount={viewCount}
          onPageChange={handlePageChange}
          onViewCountChange={handleViewCountChange}
        />
      </div>
    </div>
  );
};

export default NotificationTable;
