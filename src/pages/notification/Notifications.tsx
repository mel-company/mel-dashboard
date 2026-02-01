import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useFetchNotificationsCursor,
  useSearchNotificationsCursor,
  useUpdateNotificationReadStatus,
} from "@/api/wrappers/notification.wrappers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Bell,
  Clock,
  MessageSquare,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import NotificationsSkeleton from "./NotificationsSkeleton";
import ErrorPage from "../miscellaneous/ErrorPage";
import EmptyPage from "../miscellaneous/EmptyPage";
import { cn } from "@/lib/utils";

const CURSOR_LIMIT = 10;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}

type Props = {};

const Notifications = ({}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const debouncedQuery = useDebouncedValue(searchQuery.trim(), 350);
  const isSearching = debouncedQuery.length > 0;

  const {
    data: cursorData,
    fetchNextPage: fetchNextCursor,
    hasNextPage: hasNextCursor,
    isFetchingNextPage: isFetchingNextCursor,
    isLoading: isCursorLoading,
    error: cursorError,
    refetch: refetchCursor,
    isFetching: isCursorFetching,
  } = useFetchNotificationsCursor({ limit: CURSOR_LIMIT }, !isSearching);

  const {
    data: searchData,
    fetchNextPage: fetchNextSearch,
    hasNextPage: hasNextSearch,
    isFetchingNextPage: isFetchingNextSearch,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch,
    isFetching: isSearchFetching,
  } = useSearchNotificationsCursor(
    { query: debouncedQuery, limit: CURSOR_LIMIT },
    isSearching
  );

  const flatNotifications = cursorData?.pages.flatMap((p) => p.data) ?? [];
  const flatSearchNotifications =
    searchData?.pages.flatMap((p) => p.data) ?? [];

  const notifications: any[] = isSearching
    ? flatSearchNotifications
    : flatNotifications;

  const hasNextPage = isSearching ? hasNextSearch : hasNextCursor;
  const isFetchingNextPage = isSearching
    ? isFetchingNextSearch
    : isFetchingNextCursor;
  const fetchNextPage = isSearching ? fetchNextSearch : fetchNextCursor;

  const error = isSearching ? searchError : cursorError;
  const refetch = isSearching ? refetchSearch : refetchCursor;
  const isFetching = isSearching ? isSearchFetching : isCursorFetching;
  const isLoading = isSearching ? isSearchLoading : isCursorLoading;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) handleLoadMore();
      },
      { rootMargin: "200px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleLoadMore, hasNextPage, isFetchingNextPage]);

  // Mutation to update read status
  const { mutate: updateReadStatus } = useUpdateNotificationReadStatus();

  // Format date to Arabic format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Search and Add Notification Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ابحث عن إشعار..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-right pr-10 pl-10"
            dir="rtl"
          />
          {searchQuery ? (
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSearchQuery("")}
              aria-label="مسح البحث"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => {}}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">إضافة إشعار</span>
          <span className="sm:hidden">إضافة</span>
        </Button>
      </div>

      {isLoading && !notifications.length ? (
        <div className="p-6">
          <NotificationsSkeleton count={5} showHeader={false} />
        </div>
      ) : error && !notifications.length ? (
        <div className="p-6">
          <ErrorPage
            error={error}
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        </div>
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">الرسالة</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <EmptyPage
                        icon={<Bell className="size-7 text-muted-foreground" />}
                        title={
                          searchQuery.trim() ? "لا توجد نتائج" : "لا يوجد إشعارات"
                        }
                        description={
                          searchQuery.trim()
                            ? "لم يتم العثور على إشعارات تطابق البحث"
                            : "ابدأ بإضافة إشعار جديد"
                        }
                        primaryAction={
                          searchQuery.trim()
                            ? {
                                label: "مسح البحث",
                                onClick: () => setSearchQuery(""),
                                icon: <X className="size-4" />,
                                variant: "outline",
                              }
                            : undefined
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => {
                    const isRead = notification?.recipients?.[0]?.read;

                    return (
                      <TableRow
                        key={notification.id}
                        className={`hover:bg-muted/50 cursor-pointer ${
                          !isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                        }`}
                        onClick={() => {
                          if (!isRead) {
                            updateReadStatus(notification?.id, {
                              onSuccess: () => {
                                navigate(`/notifications/${notification?.id}`);
                              },
                              onError: () => {
                                navigate(`/notifications/${notification?.id}`);
                              },
                            });
                          } else {
                            navigate(`/notifications/${notification?.id}`);
                          }
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-x-2">
                              {!isRead && (
                                <div className="top-0 right-0 ">
                                  <div className="relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-2 rounded-full bg-red-500 animate-pulse" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-4 rounded-full bg-red-500/50 animate-ping" />
                                  </div>
                                </div>
                              )}
                              <Bell
                                className={cn(
                                  "size-4 text-muted-foreground",
                                  isRead
                                    ? "text-muted-foreground"
                                    : "text-yellow-500"
                                )}
                              />
                            </div>
                            <span className="font-medium">
                              {notification.title || "بدون عنوان"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 max-w-xs">
                            <MessageSquare className="size-4 text-muted-foreground shrink-0" />
                            <span className="text-sm line-clamp-2">
                              {notification.message || "بدون رسالة"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="size-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Link to={`/notifications/${notification.id}`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="gap-2"
                            >
                              <FileText className="size-4" />
                              التفاصيل
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
          <div ref={loadMoreRef} className="flex justify-center py-6">
            {hasNextPage && (
              <Button
                variant="secondary"
                className="gap-2"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جاري التحميل...
                  </>
                ) : (
                  "تحميل المزيد"
                )}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;
