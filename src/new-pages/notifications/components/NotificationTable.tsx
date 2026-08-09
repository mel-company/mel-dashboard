import { useEffect, useMemo, useState } from "react";
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
};

const NotificationTable = ({
  notifications,
  totalAvailable,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onRowClick,
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
        "w-full overflow-hidden rounded-3xl border p-3.5 sm:p-6",
        "border-slate-200/80 bg-white",
        "dark:border-slate-800 dark:bg-slate-950",
      )}
    >
      <div className="mb-4 text-right sm:mb-5">
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
          جميع الأشعارات
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          أجمالي العناصر المتاحة{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {totalAvailable}
          </span>
        </p>
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

      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-white/5 md:block">
        <div className="hidden flex-wrap items-center justify-end gap-2 text-sm md:flex">
          <select
            className="rounded-md border border-sky-500 bg-transparent p-1.5 font-medium text-sky-500 dark:bg-sky-500/15 dark:text-sky-400"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            aria-label="الترتيب"
          >
            <option value="desc">تنازلي</option>
            <option value="asc">تصاعدي</option>
          </select>
          <span className="font-light text-slate-500 opacity-80 dark:text-slate-400">
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
