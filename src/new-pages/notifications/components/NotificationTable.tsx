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
        "w-full overflow-hidden rounded-[24px] border border-transparent bg-card p-3 sm:p-4",
      )}
    >
      <div className="mb-4 flex flex-col gap-4 sm:mb-5 md:flex-row md:items-center md:justify-between">
        {toolbar ? <div className="hidden md:block">{toolbar}</div> : null}
        <div className="text-right md:ms-auto">
          <h2
            className="text-base font-normal text-foreground sm:text-xl"
            style={{ fontFamily: '"Setar XS", var(--font-family)' }}
          >
            جميع الأشعارات
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            أجمالي العناصر المتاحة{" "}
            <span className="font-bold text-foreground">{totalAvailable}</span>
          </p>
        </div>
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

      <div className="mt-4 space-y-3 border-t border-border pt-4 md:block">
        <div className="hidden flex-wrap items-center justify-end gap-3 text-sm md:flex">
          <select
            className="rounded-lg border border-[#7d26f726] bg-transparent px-3 py-1.5 font-bold text-[#7d26f7]"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            aria-label="الترتيب"
          >
            <option value="desc">تنازلي</option>
            <option value="asc">تصاعدي</option>
          </select>
          <span className="text-muted-foreground">مرتبة بشكل</span>
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
