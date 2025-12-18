import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DISCOUNT_STATUS } from "@/utils/constants";
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Plus, Tag, Calendar, Package, X } from "lucide-react";
import {
  useFetchDiscounts,
  useSearchDiscounts,
} from "@/api/wrappers/discount.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import EmptyPage from "../miscellaneous/EmptyPage";
import DiscountsSkeleton from "./DiscountsSkeleton";

const Discounts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 9;

  function useDebouncedValue<T>(value: T, delayMs: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const id = setTimeout(() => setDebouncedValue(value), delayMs);
      return () => clearTimeout(id);
    }, [value, delayMs]);

    return debouncedValue;
  }

  function getPaginationRange(current: number, total: number) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const range: Array<number | "ellipsis"> = [];
    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);

    range.push(1);
    if (left > 2) range.push("ellipsis");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < total - 1) range.push("ellipsis");
    range.push(total);

    return range;
  }

  const debouncedQuery = useDebouncedValue(searchQuery.trim(), 350);
  const isSearching = debouncedQuery.length > 0;

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const {
    data: listData,
    isLoading: isListLoading,
    error: listError,
    refetch: refetchList,
    isFetching: isListFetching,
  } = useFetchDiscounts(
    {
      page,
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
  } = useSearchDiscounts({
    query: debouncedQuery,
    page,
    limit,
  });

  const activeData = isSearching ? searchData : listData;
  const discounts: any[] = !activeData
    ? []
    : Array.isArray(activeData)
    ? activeData
    : activeData.data ?? [];

  const error = isSearching ? searchError : listError;
  const refetch = isSearching ? refetchSearch : refetchList;
  const isFetching = isSearching ? isSearchFetching : isListFetching;
  const isLoading = isSearching ? isSearchLoading : isListLoading;

  const meta =
    activeData && !Array.isArray(activeData)
      ? {
          total: activeData.total ?? 0,
          page: activeData.page ?? page,
          limit: activeData.limit ?? limit,
        }
      : undefined;

  const totalPages =
    meta && meta.total && meta.limit
      ? Math.max(1, Math.ceil(meta.total / meta.limit))
      : 1;

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const goToPage = (nextPage: number) => {
    const safe = Math.min(Math.max(1, nextPage), totalPages || 1);
    if (safe === page) return;
    setPage(safe);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        <Button className="gap-2 w-full sm:w-auto" onClick={() => {}}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">إضافة خصم</span>
          <span className="sm:hidden">إضافة</span>
        </Button>
      </div>

      {meta && totalPages > 1 ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* <div className="text-sm text-muted-foreground" dir="rtl">
            {meta.total > 0 ? (
              <span>
                عرض {Math.min((page - 1) * limit + 1, meta.total)}-
                {Math.min(page * limit, meta.total)} من {meta.total}
              </span>
            ) : null}
          </div> */}

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    goToPage(page - 1);
                  }}
                  aria-disabled={page <= 1}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {getPaginationRange(page, totalPages).map((item, idx) => (
                <PaginationItem key={`${item}-${idx}`}>
                  {item === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      isActive={item === page}
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(item);
                      }}
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    goToPage(page + 1);
                  }}
                  aria-disabled={page >= totalPages}
                  className={
                    page >= totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && !activeData ? (
          <div className="col-span-full">
            <DiscountsSkeleton count={6} showHeader={false} />
          </div>
        ) : error && !activeData ? (
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
                      onClick: () => {},
                      icon: <Plus className="size-4" />,
                    }
              }
            />
          </div>
        ) : (
          discounts.map((discount) => {
            const statusBadge = getStatusBadge(discount.discount_status);
            return (
              <Link key={discount.id} to={`/discounts/${discount.id}`}>
                <Card className="group gap-y-0 h-full cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
                  <CardHeader className="pb-4">
                    <div className="relative h-32 flex items-center justify-center w-full overflow-hidden rounded-lg bg-linear-to-br from-primary/20 to-primary/5">
                      <div className="flex flex-col items-center gap-2">
                        <Tag className="size-12 text-primary" />
                        <div className="text-3xl font-bold text-primary">
                          {discount.discount_percentage}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardTitle className="line-clamp-1 pb-2 text-right text-lg font-semibold">
                      {discount.name}
                    </CardTitle>
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
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-4" />
                        <span>
                          {formatDate(discount.discount_start_date)} -{" "}
                          {formatDate(discount.discount_end_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Package className="size-4" />
                          <span>{discount._count?.products ?? 0} منتج</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="size-4" />
                          <span>{discount._count?.categories ?? 0} فئة</span>
                        </div>
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
          })
        )}
      </div>
    </div>
  );
};

export default Discounts;
