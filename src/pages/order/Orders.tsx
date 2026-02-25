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
import {
  Search,
  Package,
  User,
  MapPin,
  Calendar,
  FileText,
  X,
  Loader2,
  Filter,
} from "lucide-react";
import { useFilterOrdersCursor } from "@/api/wrappers/order.wrappers";
import OrderFilterDialog, { type OrderFilterValues } from "./OrderFilterDialog";
import ErrorPage from "../miscellaneous/ErrorPage";
import EmptyPage from "../miscellaneous/EmptyPage";
import OrdersSkeleton from "./OrdersSkeleton";

const CURSOR_LIMIT = 20;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}

const Orders = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<OrderFilterValues>({
    status: undefined,
    period: undefined,
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
  } = useFilterOrdersCursor({
    query: debouncedQuery || undefined,
    status: filters.status,
    period: filters.period,
    limit: CURSOR_LIMIT,
  });

  const orders: any[] = filterData?.pages.flatMap((p) => p.data) ?? [];
  const hasData = filterData !== undefined;

  const hasActiveFilters = !!filters.status || !!filters.period;

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

  // Calculate total price for order (supports variant.price and quantity)
  const calculateTotal = (orderProducts: any[] = []) => {
    return orderProducts.reduce((sum, op) => {
      const price = op.variant?.price ?? op.price ?? 0;
      const qty = op.quantity ?? 1;
      return sum + price * qty;
    }, 0);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { className: string; text: string }> = {
      PENDING: { className: "bg-yellow-600 text-white", text: "قيد الانتظار" },
      PROCESSING: {
        className: "bg-blue-600 text-white",
        text: "قيد المعالجة",
      },
      SHIPPED: { className: "bg-purple-600 text-white", text: "تم الشحن" },
      DELIVERED: { className: "bg-green-600 text-white", text: "تم التسليم" },
      CANCELLED: { className: "bg-red-600 text-white", text: "ملغي" },
    };
    return (
      statusMap[status] || { className: "bg-gray-600 text-white", text: status }
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 max-w-full sm:max-w-md gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="ابحث عن طلب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-right pl-10 pr-10"
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
                setFilters({ status: undefined, period: undefined })
              }
              className="gap-1"
            >
              <X className="size-4" />
              مسح التصفية
            </Button>
          )}
        </div>
      </div>

      <OrderFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        values={filters}
        onApply={setFilters}
        onClear={() => setFilters({ status: undefined, period: undefined })}
      />

      {isLoading && !hasData ? (
        <OrdersSkeleton showHeader={false} rows={6} />
      ) : error && !hasData ? (
        <ErrorPage
          error={error}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : orders.length === 0 ? (
        <EmptyPage
          title={
            searchQuery.trim() || hasActiveFilters
              ? "لا توجد نتائج"
              : "لا توجد طلبات"
          }
          description={
            searchQuery.trim() || hasActiveFilters
              ? "لم يتم العثور على طلبات تطابق البحث أو التصفية. جرّب تغيير المعايير."
              : "لم يتم العثور على طلبات."
          }
          icon={<Package className="size-7 text-muted-foreground" />}
          primaryAction={
            searchQuery.trim() || hasActiveFilters
              ? {
                  label: "مسح البحث والتصفية",
                  onClick: () => {
                    setSearchQuery("");
                    setFilters({ status: undefined, period: undefined });
                  },
                  icon: <X className="size-4" />,
                  variant: "secondary",
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
                  <TableHead className="text-right">رقم الطلب</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">المنتجات</TableHead>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">المبلغ الإجمالي</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const customer = order.customer?.user;
                  const statusBadge = getStatusBadge(order.status);
                  const total = calculateTotal(order.products ?? []);
                  const productCount =
                    order._count?.products ?? order.products?.length ?? 0;
                  const productTitles = (order.products ?? [])
                    .map(
                      (p: any) => p.variant?.product?.title ?? p.product?.title,
                    )
                    .filter(Boolean);

                  return (
                    <TableRow
                      key={order.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <TableCell className="font-medium">
                        #{String(order.id).slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        {customer ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="size-4 text-muted-foreground" />
                              <span className="font-medium">
                                {customer.name ?? "—"}
                              </span>
                            </div>
                            {customer.phone ? (
                              <div className="text-sm text-muted-foreground">
                                {customer.phone}
                              </div>
                            ) : customer.email ? (
                              <div className="text-sm text-muted-foreground">
                                {customer.email}
                              </div>
                            ) : null}
                            {customer.location ? (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="size-3" />
                                {customer.location}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            غير معروف
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Package className="size-4 text-muted-foreground" />
                            <span className="font-medium">
                              {productCount} منتج
                            </span>
                          </div>
                          {productTitles.length ? (
                            <div className="text-xs text-muted-foreground max-w-xs">
                              {productTitles.slice(0, 2).join("، ")}
                              {productTitles.length > 2 ? "..." : ""}
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-xs">
                          <MapPin className="size-4 text-muted-foreground shrink-0" />
                          <div>
                            <span className="text-sm line-clamp-2">
                              {order.nearest_point}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="default"
                          className={`${statusBadge.className} text-sm`}
                        >
                          {statusBadge.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {total ? `${total.toFixed(2)} د.ع` : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="size-4 text-muted-foreground" />
                          <span>
                            {order.createdAt
                              ? formatDate(order.createdAt)
                              : "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right is-rtl direction-rtl">
                        <Link
                          to={`/orders/${order.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
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

          {hasNextPage && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isFetchingNextPage ? (
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                >
                  تحميل المزيد
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;
