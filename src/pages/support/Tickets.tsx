import { useEffect, useRef, useCallback, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  FileText,
  X,
  List,
  BookOpen,
  Loader2,
} from "lucide-react";
import {
  useFetchTicketsStoreCursor,
  useSearchTicketsStoreCursor,
} from "@/api/wrappers/ticket.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import EmptyPage from "../miscellaneous/EmptyPage";
import { Skeleton } from "@/components/ui/skeleton";

const CURSOR_LIMIT = 10;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}

const TICKET_TYPES = [
  { value: "BUG", label: "خطأ" },
  { value: "FEATURE_REQUEST", label: "طلب ميزة" },
  { value: "QUESTION", label: "سؤال" },
  { value: "SUPPORT", label: "دعم" },
  { value: "FEEDBACK", label: "ملاحظة" },
  { value: "REPORT", label: "بلاغ" },
  { value: "OTHER", label: "أخرى" },
] as const;

const DEPARTMENTS = [
  { value: "CUSTOMER_SERVICE", label: "خدمة العملاء" },
  { value: "FINANCE", label: "مالية" },
  { value: "MARKETING", label: "تسويق" },
  { value: "SALES", label: "مبيعات" },
  { value: "IT", label: "تقنية المعلومات" },
] as const;

const STATUS = [
  { value: "OPEN", label: "مفتوح" },
  { value: "CLOSED", label: "مغلق" },
  { value: "IN_PROGRESS", label: "قيد التنفيذ" },
  { value: "ON_HOLD", label: "معلق" },
  { value: "RESOLVED", label: "محلول" },
  { value: "CANCELLED", label: "ملغي" },
] as const;

const Tickets = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get("status") || "open";
  const [searchQuery, setSearchQuery] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);

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
  } = useFetchTicketsStoreCursor(
    {
      limit: CURSOR_LIMIT,
      status: statusParam === "all" ? "all" : statusParam,
    },
    !isSearching
  );

  const {
    data: searchData,
    fetchNextPage: fetchNextSearch,
    hasNextPage: hasNextSearch,
    isFetchingNextPage: isFetchingNextSearch,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch,
    isFetching: isSearchFetching,
  } = useSearchTicketsStoreCursor(
    { query: debouncedQuery, limit: CURSOR_LIMIT },
    isSearching
  );

  const flatTickets = cursorData?.pages.flatMap((p) => p.data) ?? [];
  const flatSearchTickets = searchData?.pages.flatMap((p) => p.data) ?? [];

  const tickets: any[] = isSearching ? flatSearchTickets : flatTickets;

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

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTicketTypeBadge = (type: string) => {
    return TICKET_TYPES.find((t) => t.value === type)?.label || type;
  };
  const getDepartmentBadge = (department: string) => {
    return DEPARTMENTS.find((d) => d.value === department)?.label || department;
  };
  const getStatusBadge = (status: string) => {
    return STATUS.find((s) => s.value === status)?.label || status;
  };

  const setStatusFilter = (status: "all" | "open") => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (status === "all") {
        next.set("status", "all");
      } else {
        next.delete("status");
      }
      return next;
    });
  };

  if (isLoading && !tickets.length) {
    return (
      <div className="space-y-4" dir="rtl">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1 max-w-md" />
          <Skeleton className="h-10 w-28" />
        </div>
        <Card>
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error && !tickets.length) {
    return (
      <ErrorPage
        error={error}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="ابحث في التذاكر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-right pr-10"
              dir="rtl"
            />
          </div>
          <div className="flex gap-2">
            {statusParam !== "all" && (
              <Button
                className="gap-2"
                variant="secondary"
                onClick={() => setStatusFilter("all")}
              >
                <List className="size-4" />
                الكل
              </Button>
            )}
            <Button className="gap-2" asChild>
              <Link to="/tickets/new">
                <Plus className="size-4" />
                فتح تذكرة
              </Link>
            </Button>
          </div>
        </div>
        <EmptyPage
          title={searchQuery.trim() ? "لا توجد نتائج" : "لا توجد تذاكر"}
          description={
            searchQuery.trim()
              ? "لم يتم العثور على تذاكر تطابق البحث."
              : "ليس لديك تذاكر دعم مفتوحة حالياً."
          }
          icon={<FileText className="size-7 text-muted-foreground" />}
          primaryAction={
            searchQuery.trim()
              ? {
                  label: "مسح البحث",
                  onClick: () => setSearchQuery(""),
                  icon: <X className="size-4" />,
                  variant: "secondary",
                }
              : {
                  label: "فتح تذكرة",
                  to: "/tickets/new",
                  icon: <Plus className="size-4" />,
                }
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ابحث في التذاكر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-right pr-10 pl-10"
            dir="rtl"
          />
          {searchQuery ? (
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery("")}
              aria-label="مسح البحث"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <div className="flex gap-2">
          {statusParam !== "all" && (
            <Button
              className="gap-2"
              variant="secondary"
              onClick={() => setStatusFilter("all")}
            >
              <List className="size-4" />
              الكل
            </Button>
          )}
          {statusParam === "all" && (
            <Button
              className="gap-2"
              variant="secondary"
              onClick={() => setStatusFilter("open")}
            >
              <BookOpen className="size-4" />
              التذاكر المفتوحة
            </Button>
          )}
          <Button className="gap-2" asChild>
            <Link to="/tickets/new">
              <Plus className="size-4" />
              فتح تذكرة
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">القسم</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <TableCell className="font-medium max-w-[200px] truncate">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{ticket.title ?? "—"}</span>
                    <span className="text-muted-foreground text-sm">
                      {ticket?.description ?? "—"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="default">
                    {getTicketTypeBadge(ticket.type)}
                  </Badge>
                </TableCell>
                <TableCell>{getDepartmentBadge(ticket.department)}</TableCell>
                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {ticket.createdAt ? formatDate(ticket.createdAt) : "—"}
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link to={`/tickets/${ticket.id}`}>
                    <Button variant="secondary" size="sm" className="gap-2">
                      <FileText className="size-4" />
                      التفاصيل
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
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
    </div>
  );
};

export default Tickets;
