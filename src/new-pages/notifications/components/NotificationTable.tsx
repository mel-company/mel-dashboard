import { useEffect, useState } from "react";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import NotificationTableHeader from "./NotificationTableHeader";
import NotificationRow from "./NotificationRow";
import type { NotificationListItem } from "@/api/types/notification";

type NotificationTableProps = {
  notifications: NotificationListItem[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  onRowClick: (notification: NotificationListItem) => void;
};

const NotificationTable = ({
  notifications,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onRowClick,
}: NotificationTableProps) => {
  const [activePage, setActivePage] = useState(1);
  const [viewCount, setViewCount] = useState(10);

  const totalPages = Math.ceil(notifications.length / viewCount) || 1;

  const handlePageChange = (page: number) => {
    setActivePage(page);
  };

  const handleViewCountChange = (count: number) => {
    setViewCount(count);
    setActivePage(1);
  };

  const startIndex = (activePage - 1) * viewCount;
  const paginatedNotifications = notifications.slice(
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

  return (
    <div className="w-full overflow-hidden rounded-3xl bg-white p-6 shadow-none">
      <Table>
        <NotificationTableHeader />
        <TableBody>
          {paginatedNotifications.map((notification, index) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              rowIndex={startIndex + index}
              onClick={onRowClick}
            />
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 border-t border-slate-100 pt-4">
        <Pagination
          totalPages={hasNextPage ? Math.max(totalPages, activePage + 1) : totalPages}
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
