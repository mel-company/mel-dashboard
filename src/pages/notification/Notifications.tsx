import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  useFetchNotifications,
  useSearchNotifications,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Plus,
  Bell,
  Clock,
  MessageSquare,
  FileText,
} from "lucide-react";
import NotificationsSkeleton from "./NotificationsSkeleton";
import ErrorPage from "../miscellaneous/ErrorPage";
import EmptyPage from "../miscellaneous/EmptyPage";
import { cn } from "@/lib/utils";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam) : 1;
  const searchPageParam = searchParams.get("s");
  const currentSearchPage = searchPageParam ? parseInt(searchPageParam) : 1;
  const limit = 10;

  const navigate = useNavigate();

  const debouncedQuery = useDebouncedValue(searchQuery.trim(), 350);
  const isSearching = debouncedQuery.length > 0;

  // Reset to page 1 when search query changes
  useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ s: "1" });
    } else {
      setSearchParams({ page: "1" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const {
    data: listData,
    isLoading: isListLoading,
    error: listError,
    refetch: refetchList,
    // isFetching: isListFetching,
  } = useFetchNotifications(
    {
      page: currentPage,
      limit,
    },
    !isSearching
  );

  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch,
    // isFetching: isSearchFetching,
  } = useSearchNotifications({
    query: debouncedQuery,
    page: currentSearchPage,
    limit,
  });

  const activeData = isSearching ? searchData : listData;
  const notifications: any[] = !activeData
    ? []
    : Array.isArray(activeData)
    ? activeData
    : activeData.data ?? [];

  const error = isSearching ? searchError : listError;
  const refetch = isSearching ? refetchSearch : refetchList;
  // const isFetching = isSearching ? isSearchFetching : isListFetching;
  const isLoading = isSearching ? isSearchLoading : isListLoading;

  const totalPages = Math.ceil(
    (listData?.total ?? searchData?.total ?? 0) / limit
  );

  // Get the actual current page based on search state
  const actualCurrentPage = isSearching ? currentSearchPage : currentPage;

  const handlePageChange = (page: number) => {
    // Ensure page is within valid bounds
    const safePage = Math.max(1, Math.min(page, totalPages || 1));
    if (isSearching) {
      setSearchParams({ s: safePage.toString() });
    } else {
      setSearchParams({ page: safePage.toString() });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          <input
            type="search"
            placeholder="ابحث عن إشعار..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-right rounded-md border border-input bg-background py-2 pr-10 pl-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
          />
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => {}}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">إضافة إشعار</span>
          <span className="sm:hidden">إضافة</span>
        </Button>
      </div>

      {totalPages > 1 && notifications.length > 0 ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(actualCurrentPage - 1);
                }}
                aria-disabled={actualCurrentPage <= 1}
                className={
                  actualCurrentPage <= 1
                    ? "pointer-events-none opacity-50 bg-black hover:bg-black text-white dark:text-black dark:bg-white dark:hover:bg-white"
                    : "bg-black hover:bg-black/90 text-white dark:text-black dark:bg-white dark:hover:bg-white/80"
                }
              />
            </PaginationItem>

            <PaginationItem className="mx-4 flex items-center gap-2">
              <span>{actualCurrentPage}</span>
              <span>من</span>
              <span>{totalPages}</span>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(actualCurrentPage + 1);
                }}
                aria-disabled={actualCurrentPage >= totalPages}
                className={
                  actualCurrentPage >= totalPages
                    ? "pointer-events-none opacity-50 bg-black hover:bg-black text-white dark:text-black dark:bg-white dark:hover:bg-white"
                    : "bg-black hover:bg-black/90 text-white dark:text-black dark:bg-white dark:hover:bg-white/80"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}

      {/* Notifications Table */}
      <Card>
        {isLoading ? (
          <div className="p-6">
            <NotificationsSkeleton count={5} showHeader={false} />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorPage error={error} onRetry={refetch} />
          </div>
        ) : (
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
                      title="لا يوجد إشعارات"
                      description={
                        searchQuery
                          ? "لم يتم العثور على إشعارات تطابق البحث"
                          : "ابدأ بإضافة إشعار جديد"
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map((notification) => {
                  const isRead = notification?.recipients[0]?.read;

                  return (
                    <TableRow
                      key={notification.id}
                      className={`hover:bg-muted/50 cursor-pointer ${
                        !isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                      }`}
                      onClick={() => {
                        // Update read status when clicking on notification
                        if (!isRead) {
                          updateReadStatus(notification?.id, {
                            onSuccess: () => {
                              // Navigate to details page after updating read status
                              navigate(`/notifications/${notification?.id}`);
                            },
                            onError: () => {
                              // Still navigate even if update fails
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
        )}
      </Card>
    </div>
  );
};

export default Notifications;
