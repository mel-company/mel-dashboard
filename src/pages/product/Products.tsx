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
  Star,
  ShoppingCart,
  Search,
  Plus,
  X,
  Loader2,
  Filter,
} from "lucide-react";
import { useFilterProductsCursor } from "@/api/wrappers/product.wrappers";
import ProductFilterDialog, {
  type ProductFilterValues,
} from "./ProductFilterDialog";
import type { ProductListItem } from "@/api/types/product";
import ErrorPage from "../miscellaneous/ErrorPage";
import ProductsSkeleton from "./ProductsSkeleton";
import EmptyPage from "../miscellaneous/EmptyPage";

const CURSOR_LIMIT = 10;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilterValues>({
    categoryIds: [],
    enabled: undefined,
  });
  const navigate = useNavigate();
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
  } = useFilterProductsCursor({
    query: debouncedQuery || undefined,
    categoryIds:
      filters.categoryIds.length > 0 ? filters.categoryIds : undefined,
    enabled: filters.enabled,
    limit: CURSOR_LIMIT,
  });

  const products: ProductListItem[] =
    filterData?.pages.flatMap((p) => p.data) ?? [];
  const imageBaseUrl = filterData?.pages?.[0]?.baseUrl ?? "";

  const hasActiveFilters =
    filters.categoryIds.length > 0 || filters.enabled !== undefined;

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 max-w-full sm:max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="ابحث عن منتج..."
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
                  categoryIds: [],
                  enabled: undefined,
                })
              }
              title="مسح التصفية"
            >
              <X className="size-4" />
            </Button>
          )}
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && products.length === 0 ? (
          <div className="col-span-full">
            <ProductsSkeleton count={8} showHeader={false} />
          </div>
        ) : error && products.length === 0 ? (
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
              title={
                debouncedQuery || hasActiveFilters
                  ? "لا توجد نتائج"
                  : "لا توجد منتجات"
              }
              description={
                debouncedQuery || hasActiveFilters
                  ? "لم يتم العثور على منتجات تطابق البحث أو التصفية. جرّب تغيير المعايير."
                  : "ابدأ بإضافة منتج جديد لعرضه هنا."
              }
              icon={<ShoppingCart className="size-7 text-muted-foreground" />}
              primaryAction={
                debouncedQuery || hasActiveFilters
                  ? {
                      label: "مسح البحث والتصفية",
                      onClick: () => {
                        setSearchQuery("");
                        setFilters({
                          categoryIds: [],
                          enabled: undefined,
                        });
                      },
                      icon: <X className="size-4" />,
                      variant: "secondary",
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
          <>
            {products.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`}>
                <Card className="group gap-y-0 h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/25">
                  <CardHeader className="pb-4">
                    <div className="relative h-40 flex items-center justify-center w-full overflow-hidden rounded-lg bg-dark-blue/10">
                      {product.image ? (
                        <img
                          src={`${imageBaseUrl}/${product.image}`}
                          alt={product.title}
                          className="h-full w-full object-contain transition-transform"
                        />
                      ) : (
                        <ShoppingCart className="size-18 text-white bg-cyan/40 rounded-full p-4" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardTitle className="line-clamp-2 leading-8 text-right">
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
                      {(product?.categories ?? []).length > 0 ? (
                        (product.categories ?? []).slice(0, 3).map((c: any) => (
                          <Badge
                            key={c.category.id}
                            variant="outline"
                            className="text-xs"
                          >
                            {c.category.name}
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

      <ProductFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        values={filters}
        onApply={setFilters}
        onClear={() =>
          setFilters({
            categoryIds: [],
            enabled: undefined,
          })
        }
      />
    </div>
  );
};

export default Products;
