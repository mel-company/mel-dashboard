import { useEffect, useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
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
  Folder,
  CheckCircle2,
  X,
  Loader2,
  Filter,
} from "lucide-react";
import AddCategoryDialog from "@/components/dialogs/AddCategoryDialog";
import CategoryFilterDialog, {
  type CategoryFilterValues,
} from "./CategoryFilterDialog";
import { useFilterCategoriesCursor } from "@/api/wrappers/category.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import EmptyPage from "../miscellaneous/EmptyPage";
import CategoriesSkeleton from "./CategoriesSkeleton";

type CategoryListItem = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  image: string;
  _count?: { products: number };
};

const CURSOR_LIMIT = 20;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}

const Categories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<CategoryFilterValues>({
    groupIds: [],
    hasDiscount: undefined,
    enabled: undefined,
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
  } = useFilterCategoriesCursor({
    query: debouncedQuery || undefined,
    groupIds: filters.groupIds.length > 0 ? filters.groupIds : undefined,
    hasDiscount: filters.hasDiscount,
    enabled: filters.enabled,
    limit: CURSOR_LIMIT,
  });

  const categories: CategoryListItem[] =
    filterData?.pages.flatMap((p) => p.data) ?? [];
  const imageBaseUrl = filterData?.pages?.[0]?.baseUrl ?? "";

  const hasActiveFilters =
    filters.groupIds.length > 0 ||
    filters.hasDiscount !== undefined ||
    filters.enabled !== undefined;

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
              placeholder="ابحث عن فئة..."
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
                  groupIds: [],
                  hasDiscount: undefined,
                  enabled: undefined,
                })
              }
              title="مسح التصفية"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link className="gap-2 w-full sm:w-auto" to="/category-group">
            <Button>
              <span className="">عرض المجموعات</span>
            </Button>
          </Link>
          <Button
            className="gap-2 w-full sm:w-auto"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">إضافة فئة</span>
            <span className="sm:hidden">إضافة</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && categories.length === 0 ? (
          <div className="col-span-full">
            <CategoriesSkeleton count={8} showHeader={false} />
          </div>
        ) : error && categories.length === 0 ? (
          <div className="col-span-full">
            <ErrorPage
              error={error}
              onRetry={() => refetch()}
              isRetrying={isFetching}
            />
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full">
            <EmptyPage
              title={
                debouncedQuery || hasActiveFilters
                  ? "لا توجد نتائج"
                  : "لا توجد فئات"
              }
              description={
                debouncedQuery || hasActiveFilters
                  ? "لم يتم العثور على فئات تطابق البحث أو التصفية. جرّب تغيير المعايير."
                  : "ابدأ بإضافة فئة جديدة لعرضها هنا."
              }
              icon={<Folder className="size-7 text-muted-foreground" />}
              primaryAction={
                debouncedQuery || hasActiveFilters
                  ? {
                      label: "مسح البحث والتصفية",
                      onClick: () => {
                        setSearchQuery("");
                        setFilters({
                          groupIds: [],
                          hasDiscount: undefined,
                          enabled: undefined,
                        });
                      },
                      icon: <X className="size-4" />,
                      variant: "default",
                    }
                  : {
                      label: "إضافة فئة",
                      onClick: () => setIsDialogOpen(true),
                      icon: <Plus className="size-4" />,
                    }
              }
            />
          </div>
        ) : (
          <>
            {categories.map((category) => (
              <Link key={category.id} to={`/categories/${category.id}`}>
                <Card className="group gap-y-0 h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/25">
                  <CardHeader className="pb-4">
                    <div className="relative h-40 flex items-center justify-center w-full overflow-hidden rounded-lg bg-dark-blue/10">
                      {category.image ? (
                        <img
                          src={`${imageBaseUrl}/${category.image}`}
                          alt={category.name}
                          className="h-full w-full object-contain transition-transform group-hover:scale-110"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.src = `https://via.placeholder.com/300x300/cccccc/666666?text=${encodeURIComponent(
                              category.name,
                            )}`;
                            target.onerror = null;
                          }}
                        />
                      ) : (
                        <Folder className="size-18 text-white bg-cyan/40 rounded-full p-4" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardTitle className="line-clamp-1 pb-2 text-right text-lg font-semibold">
                      {category.name}
                    </CardTitle>
                    <p className="text-md text-muted-foreground line-clamp-3 text-right">
                      {category.description}
                    </p>
                    <div className="mb-2 flex items-center gap-2">
                      {category.enabled ? (
                        <Badge
                          variant="default"
                          className="bg-green-600 gap-1 text-sm"
                        >
                          <CheckCircle2 className="size-3" />
                          مفعّل
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-sm bg-red-600 text-white"
                        >
                          معطّل
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t pt-2">
                    <div>
                      <span className="text-md text-muted-foreground">
                        عدد المنتجات: {category._count?.products ?? 0}
                      </span>
                    </div>
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

      <AddCategoryDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <CategoryFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        values={filters}
        onApply={setFilters}
        onClear={() =>
          setFilters({
            groupIds: [],
            hasDiscount: undefined,
            enabled: undefined,
          })
        }
      />
    </div>
  );
};

export default Categories;
