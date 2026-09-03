import { Bell } from "lucide-react";
import type { ReactNode } from "react";
import NotificationTable from "./NotificationTable";
import NotificationsSkeleton from "@/pages/notification/NotificationsSkeleton";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import type { useNotificationsPage } from "@/hooks/use-notifications-page";

type NotificationsContentProps = {
  actions: ReturnType<typeof useNotificationsPage>;
  toolbar?: ReactNode;
};

const NotificationsContent = ({
  actions,
  toolbar,
}: NotificationsContentProps) => {
  const {
    notifications,
    totalAvailable,
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
      <div className="rounded-[24px] border border-[#e7edf6] bg-white p-6 shadow-[0_2px_12px_rgba(17,44,113,0.05)] dark:border-transparent dark:bg-card dark:shadow-none">
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
      <div className="rounded-[24px] border border-[#e7edf6] bg-white p-6 shadow-[0_2px_12px_rgba(17,44,113,0.05)] dark:border-transparent dark:bg-card dark:shadow-none">
        {toolbar ? <div className="mb-4 hidden lg:block">{toolbar}</div> : null}
        <EmptyPage
          icon={<Bell className="size-7 text-[#91a0b6]" />}
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
      totalAvailable={totalAvailable}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      onRowClick={handleRowClick}
      toolbar={toolbar}
    />
  );
};

export default NotificationsContent;
