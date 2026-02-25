import { useEffect, useRef, useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Search, Plus, FileText, X, Loader2, Filter } from "lucide-react";
import { useFilterTicketsStoreCursor } from "@/api/wrappers/ticket.wrappers";
import TicketFilterDialog, {
  type TicketFilterValues,
  TICKET_TYPES,
  TICKET_DEPARTMENTS,
  TICKET_STATUSES,
} from "./TicketFilterDialog";
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

const Tickets = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<TicketFilterValues>({
    type: undefined,
    status: undefined,
    department: undefined,
  });
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebouncedValue(searchQuery.trim(), 350);

  const {
    data: filterData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useFilterTicketsStoreCursor({
    query: debouncedQuery || undefined,
    type: filters.type,
    status: filters.status,
    department: filters.department,
    limit: CURSOR_LIMIT,
  });

  const tickets: any[] = filterData?.pages.flatMap((p) => p.data) ?? [];
  const hasData = filterData !== undefined;
  const hasActiveFilters =
    !!filters.type || !!filters.status || !!filters.department;

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
      { rootMargin: "200px", threshold: 0.1 },
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
    return (
      TICKET_DEPARTMENTS.find((d) => d.value === department)?.label ||
      department
    );
  };
  const getStatusBadge = (status: string) => {
    return TICKET_STATUSES.find((s) => s.value === status)?.label || status;
  };

  if (isLoading && !hasData) {
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

  if (error && !hasData) {
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
          <div className="flex flex-1 max-w-full sm:max-w-md gap-2">
            <div className="relative flex-1">
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
            <Button
              variant={hasActiveFilters ? "default" : "secondary"}
              size="icon"
              onClick={() => setIsFilterDialogOpen(true)}
              title="تصفية"
            >
              <Filter className="size-4" />
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setFilters({
                    type: undefined,
                    status: undefined,
                    department: undefined,
                  })
                }
                className="gap-1"
              >
                <X className="size-4" />
                مسح التصفية
              </Button>
            )}
          </div>
          <Button className="gap-2" asChild>
            <Link to="/tickets/new">
              <Plus className="size-4" />
              فتح تذكرة
            </Link>
          </Button>
        </div>
        <TicketFilterDialog
          open={isFilterDialogOpen}
          onOpenChange={setIsFilterDialogOpen}
          values={filters}
          onApply={setFilters}
          onClear={() =>
            setFilters({
              type: undefined,
              status: undefined,
              department: undefined,
            })
          }
        />
        <EmptyPage
          title={
            searchQuery.trim() || hasActiveFilters
              ? "لا توجد نتائج"
              : "لا توجد تذاكر"
          }
          description={
            searchQuery.trim() || hasActiveFilters
              ? "لم يتم العثور على تذاكر تطابق البحث أو التصفية. جرّب تغيير المعايير."
              : "ليس لديك تذاكر دعم مفتوحة حالياً."
          }
          icon={<FileText className="size-7 text-muted-foreground" />}
          primaryAction={
            searchQuery.trim() || hasActiveFilters
              ? {
                  label: "مسح البحث والتصفية",
                  onClick: () => {
                    setSearchQuery("");
                    setFilters({
                      type: undefined,
                      status: undefined,
                      department: undefined,
                    });
                  },
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
        <div className="flex flex-1 max-w-full sm:max-w-md gap-2">
          <div className="relative flex-1">
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
          <Button
            variant={hasActiveFilters ? "default" : "secondary"}
            size="icon"
            onClick={() => setIsFilterDialogOpen(true)}
            title="تصفية"
          >
            <Filter className="size-4" />
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setFilters({
                  type: undefined,
                  status: undefined,
                  department: undefined,
                })
              }
              className="gap-1"
            >
              <X className="size-4" />
              مسح التصفية
            </Button>
          )}
        </div>
        <Button className="gap-2" asChild>
          <Link to="/tickets/new">
            <Plus className="size-4" />
            فتح تذكرة
          </Link>
        </Button>
      </div>

      <TicketFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        values={filters}
        onApply={setFilters}
        onClear={() =>
          setFilters({
            type: undefined,
            status: undefined,
            department: undefined,
          })
        }
      />

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
