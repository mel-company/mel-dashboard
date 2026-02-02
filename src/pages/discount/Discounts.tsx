import { useEffect, useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { DISCOUNT_STATUS } from "@/utils/constants";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Tag, Calendar, X, Loader2 } from "lucide-react";
import {
  useFetchDiscountsCursor,
  useSearchDiscountsCursor,
} from "@/api/wrappers/discount.wrappers";
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
  } = useFetchDiscountsCursor({ limit: CURSOR_LIMIT }, !isSearching);

  const {
    data: searchData,
    fetchNextPage: fetchNextSearch,
    hasNextPage: hasNextSearch,
    isFetchingNextPage: isFetchingNextSearch,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch,
    isFetching: isSearchFetching,
  } = useSearchDiscountsCursor(
    { query: debouncedQuery, limit: CURSOR_LIMIT },
    isSearching
  );

  const flatDiscounts = cursorData?.pages.flatMap((p) => p.data) ?? [];
  const flatSearchDiscounts = searchData?.pages.flatMap((p) => p.data) ?? [];

  const discounts: any[] = isSearching ? flatSearchDiscounts : flatDiscounts;

  const baseUrl = cursorData?.pages?.[0]?.baseUrl ?? "";
  const searchBaseUrl = searchData?.pages?.[0]?.baseUrl ?? "";
  // @ts-ignore
  const imageBaseUrl = isSearching ? searchBaseUrl : baseUrl;

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
        <div className="relative flex-1 max-w-full sm:max-w-md">
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
        <Link to="/discounts/add">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="size-4" />
            <span className="hidden sm:inline">إضافة خصم</span>
            <span className="sm:hidden">إضافة</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              title={searchQuery.trim() ? "لا توجد نتائج" : "لا توجد خصومات"}
              description={
                searchQuery.trim()
                  ? "لم يتم العثور على خصومات تطابق البحث. جرّب كلمات أخرى."
                  : "ابدأ بإضافة خصم جديد لعرضه هنا."
              }
              icon={<Tag className="size-7 text-muted-foreground" />}
              primaryAction={
                searchQuery.trim()
                  ? {
                      label: "مسح البحث",
                      onClick: () => setSearchQuery(""),
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
                            src={`${imageBaseUrl}/${discount.image}`}
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
    </div>
  );
};

export default Discounts;
