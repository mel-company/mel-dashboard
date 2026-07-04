import { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useFetchNotificationsCursor,
  useSearchNotificationsCursor,
  useUpdateNotificationReadStatus,
} from "@/api/wrappers/notification.wrappers";
import { useMe } from "@/api/wrappers/auth.wrappers";
import { useInfiniteScroll } from "@/hooks/use-table-data";
import type {
  NotificationFilterValues,
  NotificationListItem,
} from "@/api/types/notification";
import { isNotificationRead, matchesNotificationFilters } from "@/new-pages/notifications/utils";

const CURSOR_LIMIT = 10;

function flattenPages<T>(pages: unknown[] | undefined): T[] {
  if (!pages) return [];

  return pages.flatMap((page) => {
    if (Array.isArray(page)) return page as T[];
    if (page && typeof page === "object" && Array.isArray((page as { data?: T[] }).data)) {
      return (page as { data: T[] }).data;
    }
    return [];
  });
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}

export function useNotificationsPage() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [filters, setFilters] = useState<NotificationFilterValues>({});

  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 350);
  const isSearching = debouncedSearch.length > 0;

  const cursorQuery = useFetchNotificationsCursor(
    { limit: CURSOR_LIMIT },
    !isSearching,
  );

  const searchQuery_ = useSearchNotificationsCursor(
    { query: debouncedSearch, limit: CURSOR_LIMIT },
    isSearching,
  );

  const activeQuery = isSearching ? searchQuery_ : cursorQuery;

  const rawNotifications = useMemo(
    () => flattenPages<NotificationListItem>(activeQuery.data?.pages),
    [activeQuery.data?.pages],
  );

  const notifications = useMemo(
    () => rawNotifications.filter((n) => matchesNotificationFilters(n, filters)),
    [rawNotifications, filters],
  );

  const unreadCount =
    me?.notificationsCount ??
    rawNotifications.filter((n) => !isNotificationRead(n)).length;

  const hasActiveFilters = Boolean(filters.type || filters.readStatus);

  const activeFilterCount = [filters.type, filters.readStatus].filter(Boolean).length;

  const loadMoreRef = useInfiniteScroll({
    hasNextPage: !!activeQuery.hasNextPage,
    isFetchingNextPage: activeQuery.isFetchingNextPage,
    fetchNextPage: activeQuery.fetchNextPage,
  });

  const { mutate: updateReadStatus, mutateAsync: updateReadStatusAsync } =
    useUpdateNotificationReadStatus();

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const handleRowClick = useCallback(
    (notification: NotificationListItem) => {
      const isRead = isNotificationRead(notification);

      if (!isRead) {
        updateReadStatus(notification.id, {
          onSettled: () => navigate(`/notifications/${notification.id}`),
        });
      } else {
        navigate(`/notifications/${notification.id}`);
      }
    },
    [navigate, updateReadStatus],
  );

  const markAllAsRead = useCallback(async () => {
    const unread = rawNotifications.filter((n) => !isNotificationRead(n));
    if (!unread.length) {
      toast.info("لا توجد إشعارات غير مقروءة");
      return;
    }

    setIsMarkingAllRead(true);
    try {
      await Promise.all(unread.map((n) => updateReadStatusAsync(n.id)));
      toast.success("تم جعل جميع الإشعارات مقروءة");
      activeQuery.refetch();
    } catch {
      toast.error("فشل في تحديث بعض الإشعارات");
    } finally {
      setIsMarkingAllRead(false);
    }
  }, [rawNotifications, updateReadStatusAsync, activeQuery]);

  return {
    notifications,
    unreadCount,
    searchQuery,
    onSearchChange: setSearchQuery,
    filters,
    setFilters,
    hasActiveFilters,
    activeFilterCount,
    handleClearFilters,
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    isLoading: activeQuery.isLoading,
    isFetchingNextPage: activeQuery.isFetchingNextPage,
    hasNextPage: !!activeQuery.hasNextPage,
    error: activeQuery.error as Error | null,
    refetch: activeQuery.refetch,
    fetchNextPage: activeQuery.fetchNextPage,
    loadMoreRef,
    handleRowClick,
    markAllAsRead,
    isMarkingAllRead,
  };
}
