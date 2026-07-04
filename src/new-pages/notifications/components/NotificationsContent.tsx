import { Bell } from "lucide-react";
import NotificationTable from "./NotificationTable";
import NotificationsSkeleton from "@/pages/notification/NotificationsSkeleton";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import type { useNotificationsPage } from "@/hooks/use-notifications-page";

type NotificationsContentProps = {
  actions: ReturnType<typeof useNotificationsPage>;
};

const NotificationsContent = ({ actions }: NotificationsContentProps) => {
  const {
    notifications,
    isLoading,
    error,
    refetch,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    handleRowClick,
    searchQuery,
    onSearchChange,
  } = actions;

  if (isLoading && !notifications.length) {
    return (
      <div className="rounded-3xl bg-white p-6">
        <NotificationsSkeleton count={8} showHeader={false} />
      </div>
    );
  }

  if (error && !notifications.length) {
    return (
      <ErrorPage
        error={error}
        onRetry={() => refetch()}
        isRetrying={isFetchingNextPage}
      />
    );
  }

  if (!notifications.length) {
    return (
      <div className="rounded-3xl bg-white p-6">
        <EmptyPage
          icon={<Bell className="size-7 text-muted-foreground" />}
          title={searchQuery.trim() ? "لا توجد نتائج" : "لا يوجد إشعارات"}
          description={
            searchQuery.trim()
              ? "لم يتم العثور على إشعارات تطابق البحث"
              : "ستظهر الإشعارات الجديدة هنا تلقائياً"
          }
          primaryAction={
            searchQuery.trim()
              ? {
                  label: "مسح البحث",
                  onClick: () => onSearchChange(""),
                }
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <NotificationTable
      notifications={notifications}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      onRowClick={handleRowClick}
    />
  );
};

export default NotificationsContent;
