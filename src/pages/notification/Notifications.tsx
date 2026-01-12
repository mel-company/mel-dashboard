import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  useFetchNotifications,
  useSearchNotifications,
} from "@/api/wrappers/notification.wrappers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search,
  Plus,
  Bell,
  Clock,
  MessageSquare,
  FileText,
  CheckCircle2,
  Circle,
} from "lucide-react";
import NotificationsSkeleton from "./NotificationsSkeleton";
import ErrorPage from "../miscellaneous/ErrorPage";
import EmptyPage from "../miscellaneous/EmptyPage";

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

  // Show loading skeleton
  if (isLoading) {
    return <NotificationsSkeleton />;
  }

  // Show error page
  if (error) {
    return <ErrorPage error={error} onRetry={refetch} />;
  }

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

      {/* Notifications Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رقم الإشعار</TableHead>
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">الرسالة</TableHead>
              <TableHead className="text-right">المستلمين</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
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
                // Check if notification has recipients (read status is at recipient level)
                const hasRecipients = notification._count?.recipients > 0;
                const isRead = false; // Since read status is per recipient, we'll default to false

                return (
                  <TableRow
                    key={notification.id}
                    className={`hover:bg-muted/50 ${
                      !isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                    }`}
                    onClick={() => {
                      navigate(`/notifications/${notification.id}`);
                    }}
                  >
                    <TableCell className="font-medium">
                      #{notification.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Bell className="size-4 text-muted-foreground" />
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
                      <Badge variant="outline" className="gap-1">
                        {hasRecipients
                          ? `${notification._count.recipients} مستلم`
                          : "عام"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isRead ? "secondary" : "default"}
                        className="gap-1"
                      >
                        {isRead ? (
                          <>
                            <CheckCircle2 className="size-3" />
                            مقروء
                          </>
                        ) : (
                          <>
                            <Circle className="size-3" />
                            غير مقروء
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to={`/notifications/${notification.id}`}>
                        <Button variant="secondary" size="sm" className="gap-2">
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
    </div>
  );
};

export default Notifications;
