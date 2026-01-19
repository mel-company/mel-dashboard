import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Plus, X, Ticket, Calendar, Users } from "lucide-react";
import {
  useFetchCoupons,
  useSearchCoupons,
} from "@/api/wrappers/coupon.wrappers";
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

const Coupons = () => {
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
    isFetching: isListFetching,
  } = useFetchCoupons(
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
    isFetching: isSearchFetching,
  } = useSearchCoupons(
    {
      query: debouncedQuery,
      page: currentSearchPage,
      limit,
    },
    isSearching
  );

  const activeData = isSearching ? searchData : listData;
  const coupons: any[] = !activeData
    ? []
    : Array.isArray(activeData)
    ? activeData
    : activeData.data ?? [];

  const error = isSearching ? searchError : listError;
  const refetch = isSearching ? refetchSearch : refetchList;
  const isFetching = isSearching ? isSearchFetching : isListFetching;
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
        <Button
          className="gap-2 w-full sm:w-auto"
          onClick={() => navigate("/coupons/add")}
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">إضافة كوبون</span>
          <span className="sm:hidden">إضافة</span>
        </Button>
      </div>

      {totalPages > 1 && coupons.length > 0 ? (
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && !activeData ? (
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
        ) : error && !activeData ? (
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
                      onClick: () => navigate("/coupons/add"),
                      icon: <Plus className="size-4" />,
                    }
              }
            />
          </div>
        ) : (
          coupons.map((coupon) => (
            <Link key={coupon.id} to={`/coupons/${coupon.id}`}>
              <Card className="group gap-y-0 h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/25">
                <CardHeader className="pb-4">
                  <div className="relative h-40 flex items-center justify-center w-full overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                    <Ticket className="size-18 text-primary" />
                  </div>
                </CardHeader>
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
          ))
        )}
      </div>
    </div>
  );
};

export default Coupons;
