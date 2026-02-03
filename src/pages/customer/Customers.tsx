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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  User,
  MapPin,
  Phone,
  ShoppingBag,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import {
  useFetchCustomersCursor,
  useSearchCustomersCursor,
} from "@/api/wrappers/customer.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import EmptyPage from "../miscellaneous/EmptyPage";
import CustomersSkeleton from "./CustomersSkeleton";

const CURSOR_LIMIT = 10;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}

const Customers = () => {
  const navigate = useNavigate();
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
  } = useFetchCustomersCursor({ limit: CURSOR_LIMIT }, !isSearching);

  const {
    data: searchData,
    fetchNextPage: fetchNextSearch,
    hasNextPage: hasNextSearch,
    isFetchingNextPage: isFetchingNextSearch,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch,
    isFetching: isSearchFetching,
  } = useSearchCustomersCursor(
    { query: debouncedQuery, limit: CURSOR_LIMIT },
    isSearching
  );

  const flatCustomers = cursorData?.pages.flatMap((p) => p.data) ?? [];
  const flatSearchCustomers = searchData?.pages.flatMap((p) => p.data) ?? [];

  const customers: any[] = isSearching ? flatSearchCustomers : flatCustomers;

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

  const hasCustomers = customers.length > 0;

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ابحث عن عميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-right pr-10"
            dir="rtl"
          />
        </div>
      </div>

      {isLoading && !customers.length ? (
        <CustomersSkeleton showHeader={false} rows={6} />
      ) : error && !customers.length ? (
        <ErrorPage
          title="خطأ في تحميل العملاء"
          error={error}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : !hasCustomers ? (
        <EmptyPage
          title={isSearching ? "لا توجد نتائج" : "لا يوجد عملاء"}
          description={
            isSearching
              ? "لم يتم العثور على عملاء يطابقون البحث"
              : "ابدأ بإضافة عميل جديد"
          }
          icon={<User className="size-7 text-muted-foreground" />}
          primaryAction={
            isSearching
              ? {
                  label: "مسح البحث",
                  onClick: () => setSearchQuery(""),
                  icon: <X className="size-4" />,
                  variant: "outline",
                }
              : undefined
          }
        />
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم العميل</TableHead>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">رقم الهاتف</TableHead>
                  <TableHead className="text-right">الموقع</TableHead>
                  <TableHead className="text-right">عدد الطلبات</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => {
                  const orderCount = customer._count?.orders ?? 0;
                  const user = customer.user;
                  const customerId = customer.id;

                  return (
                    <TableRow
                      key={customerId}
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/customers/${customerId}`)}
                    >
                      <TableCell className="font-medium">
                        #{customerId.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-muted-foreground" />
                          <span className="font-medium">
                            {user?.name ?? "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="size-4 text-muted-foreground" />
                          <span className="text-sm">{user?.phone ?? "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-xs">
                          <MapPin className="size-4 text-muted-foreground shrink-0" />
                          <span className="text-sm line-clamp-1">
                            {user?.location ?? "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="size-4 text-muted-foreground" />
                          <span className="font-medium">
                            {orderCount} {orderCount === 1 ? "طلب" : "طلبات"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Link to={`/customers/${customerId}`}>
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
                })}
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

export default Customers;
