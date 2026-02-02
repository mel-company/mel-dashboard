import { useEffect, useRef, useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  X,
  Ticket,
  Calendar,
  Users,
  Loader2,
} from "lucide-react";
import {
  useFetchCouponsCursor,
  useSearchCouponsCursor,
} from "@/api/wrappers/coupon.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import EmptyPage from "../miscellaneous/EmptyPage";

const CURSOR_LIMIT = 20;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}

const Coupons = () => {
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
  } = useFetchCouponsCursor({ limit: CURSOR_LIMIT }, !isSearching);

  const {
    data: searchData,
    fetchNextPage: fetchNextSearch,
    hasNextPage: hasNextSearch,
    isFetchingNextPage: isFetchingNextSearch,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch,
    isFetching: isSearchFetching,
  } = useSearchCouponsCursor(
    { query: debouncedQuery, limit: CURSOR_LIMIT },
    isSearching
  );

  const flatCoupons = cursorData?.pages.flatMap((p) => p.data) ?? [];
  const flatSearchCoupons = searchData?.pages.flatMap((p) => p.data) ?? [];

  const coupons: any[] = isSearching ? flatSearchCoupons : flatCoupons;

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

  const formatCouponValue = (coupon: any) => {
    if (coupon.type === "PERCENTAGE") {
      return `${coupon.value}%`;
    } else if (coupon.type === "FIXED") {
      return `${coupon.value} د.ع`;
    }
    return coupon.value;
  };

  const formatAppliesTo = (appliesTo: string) => {
    const map: Record<string, string> = {
      ALL: "الكل",
      PRODUCT: "منتج",
      CATEGORY: "فئة",
    };
    return map[appliesTo] || appliesTo;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const isExpired = (coupon: any) => {
    if (!coupon.expiresAt) return false;
    return new Date(coupon.expiresAt) < new Date();
  };

  const isNotStarted = (coupon: any) => {
    if (!coupon.startsAt) return false;
    return new Date(coupon.startsAt) > new Date();
  };

  return (
    <div className="space-y-6">
      {/* Search and Add Coupon Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ابحث عن كوبون..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-right pr-10"
            dir="rtl"
          />
        </div>
        <Button
          className="gap-2 w-full sm:w-auto"
          onClick={() => navigate("/coupons/add")}
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">إضافة كوبون</span>
          <span className="sm:hidden">إضافة</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && !coupons.length ? (
          <div className="col-span-full">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-32 bg-muted rounded-lg" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : error && !coupons.length ? (
          <div className="col-span-full">
            <ErrorPage
              error={error}
              onRetry={() => refetch()}
              isRetrying={isFetching}
            />
          </div>
        ) : coupons.length === 0 ? (
          <div className="col-span-full">
            <EmptyPage
              title={searchQuery.trim() ? "لا توجد نتائج" : "لا توجد كوبونات"}
              description={
                searchQuery.trim()
                  ? "لم يتم العثور على كوبونات تطابق البحث. جرّب كلمات أخرى."
                  : "ابدأ بإضافة كوبون جديد لعرضه هنا."
              }
              icon={<Ticket className="size-7 text-muted-foreground" />}
              primaryAction={
                searchQuery.trim()
                  ? {
                      label: "مسح البحث",
                      onClick: () => setSearchQuery(""),
                      icon: <X className="size-4" />,
                      variant: "secondary",
                    }
                  : {
                      label: "إضافة كوبون",
                      to: "/coupons/add",
                      icon: <Plus className="size-4" />,
                    }
              }
            />
          </div>
        ) : (
          <>
            {coupons.map((coupon) => (
              <Link key={coupon.id} to={`/coupons/${coupon.id}`}>
                <Card className="group gap-y-0 h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/25">
                  <CardContent className="space-y-3">
                    <CardTitle className="line-clamp-2 text-right">
                      {coupon.code}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2 text-right">
                      {coupon.description || "—"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-lg font-bold text-primary">
                          {formatCouponValue(coupon)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatAppliesTo(coupon.appliesTo)}
                        </span>
                      </div>
                      <Badge
                        variant={
                          !coupon.isActive || isExpired(coupon)
                            ? "secondary"
                            : isNotStarted(coupon)
                            ? "outline"
                            : "default"
                        }
                      >
                        {!coupon.isActive
                          ? "غير مفعل"
                          : isExpired(coupon)
                          ? "منتهي"
                          : isNotStarted(coupon)
                          ? "لم يبدأ"
                          : "نشط"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {coupon.minOrderTotal ? (
                        <Badge variant="outline" className="text-xs">
                          حد أدنى: {coupon.minOrderTotal} د.ع
                        </Badge>
                      ) : null}
                      {coupon.usageLimit ? (
                        <Badge variant="outline" className="text-xs">
                          <Users className="size-3 mr-1" />
                          {coupon.usedCount || 0}/{coupon.usageLimit}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      {coupon.startsAt ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          <span>يبدأ: {formatDate(coupon.startsAt)}</span>
                        </div>
                      ) : null}
                      {coupon.expiresAt ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          <span>ينتهي: {formatDate(coupon.expiresAt)}</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex mb-2 flex-wrap gap-2">
                      {coupon._count?.products > 0 ? (
                        <Badge variant="outline" className="text-xs">
                          {coupon._count.products} منتج
                        </Badge>
                      ) : null}
                      {coupon._count?.categories > 0 ? (
                        <Badge variant="outline" className="text-xs">
                          {coupon._count.categories} فئة
                        </Badge>
                      ) : null}
                      {coupon._count?.redemptions > 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          {coupon._count.redemptions} استخدام
                        </Badge>
                      ) : null}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t pt-2">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(coupon.createdAt)}
                    </span>
                    <Badge variant="default" className="px-2 py-1">
                      عرض التفاصيل
                    </Badge>
                  </CardFooter>
                </Card>
              </Link>
            ))}
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

export default Coupons;
