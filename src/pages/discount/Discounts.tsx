import { useEffect, useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { DISCOUNT_STATUS } from "@/utils/constants";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Tag, Calendar, X, Loader2, Filter } from "lucide-react";
import { useFilterDiscountsCursor } from "@/api/wrappers/discount.wrappers";
import DiscountFilterDialog, {
  type DiscountFilterValues,
} from "./DiscountFilterDialog";
import ErrorPage from "../miscellaneous/ErrorPage";
import EmptyPage from "../miscellaneous/EmptyPage";
import DiscountsSkeleton from "./DiscountsSkeleton";

const CURSOR_LIMIT = 9;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}

const Discounts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<DiscountFilterValues>({
    status: undefined,
    startDate: "",
    endDate: "",
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
  } = useFilterDiscountsCursor({
    query: debouncedQuery || undefined,
    status: filters.status,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    limit: CURSOR_LIMIT,
  });

  const discounts: any[] = filterData?.pages.flatMap((p) => p.data) ?? [];
  const baseUrl = filterData?.pages?.[0]?.baseUrl ?? "";

  const hasActiveFilters =
    !!filters.status || !!filters.startDate || !!filters.endDate;

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

  // Get status badge variant and text
  const getStatusBadge = (status: string) => {
    switch (status) {
      case DISCOUNT_STATUS.ACTIVE:
        return {
          className: "bg-green-600 text-white",
          text: "نشط",
        };
      case DISCOUNT_STATUS.INACTIVE:
        return {
          className: "bg-gray-600 text-white",
          text: "غير نشط",
        };
      case DISCOUNT_STATUS.EXPIRED:
        return {
          className: "bg-red-600 text-white",
          text: "منتهي",
        };
      default:
        return {
          className: "bg-gray-600 text-white",
          text: status,
        };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Add Discount Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 max-w-full sm:max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="ابحث عن خصم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-right pr-10"
              dir="rtl"
            />
          </div>
          <Button
            variant={hasActiveFilters ? "default" : "secondary"}
            size="icon"
            className="shrink-0"
            onClick={() => setIsFilterDialogOpen(true)}
            title="تصفية"
          >
            <Filter className="size-4" />
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() =>
                setFilters({
                  status: undefined,
                  startDate: "",
                  endDate: "",
                })
              }
              title="مسح التصفية"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
        <Link to="/discounts/add">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="size-4" />
            <span className="hidden sm:inline">إضافة خصم</span>
            <span className="sm:hidden">إضافة</span>
          </Button>
        </Link>
      </div>

      <div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        data-base-url={baseUrl}
      >
        {isLoading && !discounts.length ? (
          <div className="col-span-full">
            <DiscountsSkeleton count={6} showHeader={false} />
          </div>
        ) : error && !discounts.length ? (
          <div className="col-span-full">
            <ErrorPage
              error={error}
              onRetry={() => refetch()}
              isRetrying={isFetching}
            />
          </div>
        ) : discounts.length === 0 ? (
          <div className="col-span-full">
            <EmptyPage
              title={
                debouncedQuery || hasActiveFilters
                  ? "لا توجد نتائج"
                  : "لا توجد خصومات"
              }
              description={
                debouncedQuery || hasActiveFilters
                  ? "لم يتم العثور على خصومات تطابق البحث أو التصفية. جرّب تغيير المعايير."
                  : "ابدأ بإضافة خصم جديد لعرضه هنا."
              }
              icon={<Tag className="size-7 text-muted-foreground" />}
              primaryAction={
                debouncedQuery || hasActiveFilters
                  ? {
                      label: "مسح البحث والتصفية",
                      onClick: () => {
                        setSearchQuery("");
                        setFilters({
                          status: undefined,
                          startDate: "",
                          endDate: "",
                        });
                      },
                      icon: <X className="size-4" />,
                      variant: "outline",
                    }
                  : {
                      label: "إضافة خصم",
                      to: "/discounts/add",
                      icon: <Plus className="size-4" />,
                    }
              }
            />
          </div>
        ) : (
          <>
            {discounts.map((discount) => {
              const statusBadge = getStatusBadge(discount.discount_status);
              return (
                <Link key={discount.id} to={`/discounts/${discount.id}`}>
                  <Card className="group gap-y-0 h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/25">
                    {/* <CardHeader className="pb-4">
                      <div className="relative h-32 flex items-center justify-center w-full overflow-hidden rounded-lg bg-linear-to-br from-primary/20 to-primary/5">
                        {discount.image ? (
                          <img
                            src={`${baseUrl}/${discount.image}`}
                            alt={discount.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Tag className="size-12 text-primary" />
                            <div className="text-3xl font-bold text-primary">
                              {discount.discount_percentage}%
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHeader> */}
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="line-clamp-1 pb-2 text-right text-lg font-semibold">
                          {discount.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="default"
                            className={`text-sm bg-primary/80 text-primary-foreground`}
                          >
                            {discount.discount_percentage}%
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 text-right">
                        {discount.description}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="default"
                          className={`${statusBadge.className} text-sm`}
                        >
                          {statusBadge.text}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="mb-4 flex items-center gap-2 text-muted-foreground">
                          <Calendar className="size-4" />
                          <span>
                            {formatDate(discount.discount_start_date)} -{" "}
                            {formatDate(discount.discount_end_date)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-end border-t pt-2">
                      <Badge variant="default" className="px-2 py-1">
                        عرض التفاصيل
                      </Badge>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
            <div
              ref={loadMoreRef}
              className="col-span-full flex justify-center py-6"
            >
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

      <DiscountFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        values={filters}
        onApply={setFilters}
        onClear={() =>
          setFilters({
            status: undefined,
            startDate: "",
            endDate: "",
          })
        }
      />
    </div>
  );
};

export default Discounts;
