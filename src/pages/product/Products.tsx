import { useEffect, useState } from "react";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Star, ShoppingCart, Search, Plus, X } from "lucide-react";
import {
  useFetchProducts,
  useSearchProducts,
} from "@/api/wrappers/product.wrappers";
import type { ProductListItem } from "@/api/types/product";
import ErrorPage from "../miscellaneous/ErrorPage";
import ProductsSkeleton from "./ProductsSkeleton";
import EmptyPage from "../miscellaneous/EmptyPage";

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

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();

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
  } = useFetchProducts(
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
  } = useSearchProducts({
    query: debouncedQuery,
    page,
    limit,
  });

  const activeData = isSearching ? searchData : listData;
  const products: ProductListItem[] = !activeData
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
    meta && meta.total && meta.limit ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const goToPage = (nextPage: number) => {
    const safe = Math.min(Math.max(1, nextPage), totalPages || 1);
    if (safe === page) return;
    setPage(safe);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* Search and Add Product Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ابحث عن منتج..."
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
          onClick={() => navigate("/products/add")}
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">إضافة منتج</span>
          <span className="sm:hidden">إضافة</span>
        </Button>
      </div>

      {meta && totalPages > 1 ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground" dir="rtl">
            {meta.total > 0 ? (
              <span>
                عرض{" "}
                {Math.min((page - 1) * limit + 1, meta.total)}-
                {Math.min(page * limit, meta.total)} من {meta.total}
              </span>
            ) : null}
          </div>

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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && !activeData ? (
          <div className="col-span-full">
            <ProductsSkeleton count={8} showHeader={false} />
          </div>
        ) : error && !activeData ? (
          <div className="col-span-full">
            <ErrorPage
              error={error}
              onRetry={() => refetch()}
              isRetrying={isFetching}
            />
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full">
            <EmptyPage
              title={searchQuery.trim() ? "لا توجد نتائج" : "لا توجد منتجات"}
              description={
                searchQuery.trim()
                  ? "لم يتم العثور على منتجات تطابق البحث. جرّب كلمات أخرى."
                  : "ابدأ بإضافة منتج جديد لعرضه هنا."
              }
              icon={<ShoppingCart className="size-7 text-muted-foreground" />}
              primaryAction={
                searchQuery.trim()
                  ? {
                      label: "مسح البحث",
                      onClick: () => setSearchQuery(""),
                      icon: <X className="size-4" />,
                      variant: "outline",
                    }
                  : {
                      label: "إضافة منتج",
                      onClick: () => navigate("/products/add"),
                      icon: <Plus className="size-4" />,
                    }
              }
            />
          </div>
        ) : (
          products.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`}>
              <Card className="group gap-y-0 h-full cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
                <CardHeader className="pb-4">
                  <div className="relative h-40 flex items-center justify-center w-full overflow-hidden rounded-lg bg-dark-blue/10">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src = `https://via.placeholder.com/300x300/cccccc/666666?text=${encodeURIComponent(
                            product.title
                          )}`;
                          target.onerror = null;
                        }}
                      />
                    ) : (
                      <ShoppingCart className="size-18 text-white bg-cyan/40 rounded-full p-4" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardTitle className="line-clamp-2 text-right">
                    {product.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2 text-right">
                    {product.description || "—"}
                  </p>
                  {typeof product.rate === "number" ? (
                    <div className="flex items-center gap-1">
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {product.rate.toFixed(1)}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex mb-2 flex-wrap gap-2">
                    {(product.categories ?? []).length > 0 ? (
                      (product.categories ?? []).slice(0, 3).map((c) => (
                        <Badge key={c.id} variant="outline" className="text-xs">
                          {c.name}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        بدون فئة
                      </Badge>
                    )}
                    {(product.categories ?? []).length > 3 ? (
                      <Badge variant="secondary" className="text-xs">
                        +{(product.categories ?? []).length - 3}
                      </Badge>
                    ) : null}
                    {product.enabled === false ? (
                      <Badge variant="secondary" className="text-xs">
                        غير مفعل
                      </Badge>
                    ) : null}
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t pt-2">
                  <span className="text-lg font-bold text-primary">
                    {typeof product.price === "number"
                      ? `${product.price.toFixed(2)} د.ع`
                      : "—"}
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

export default Products;
