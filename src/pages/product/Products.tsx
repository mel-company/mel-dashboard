/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Star,
  ShoppingCart,
  Search,
  Plus,
  X,
  Loader2,
  Package,
  LayoutGrid,
  List,
  Eye,
  Pencil,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import {
  useFilterProductsCursor,
  useDeleteProduct,
  useFetchProductStats,
} from "@/api/wrappers/product.wrappers";
import { useFetchCategories } from "@/api/wrappers/category.wrappers";
import ProductFilterDialog, {
  type ProductFilterValues,
} from "./ProductFilterDialog";
import ProductStatsCards from "./ProductStatsCards";
import type { ProductListItem } from "@/api/types/product";
import ErrorPage from "../miscellaneous/ErrorPage";
import ProductsSkeleton from "./ProductsSkeleton";
import EmptyPage from "../miscellaneous/EmptyPage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BaseCard, FeaturedCard } from "@/components/table/top-cards";
import { PackageIcon, RemoteControlBulkRounded } from "@hugeicons-pro/core-bulk-rounded";
import Pagination from "@/components/table/pagination";
import SwitchTab from "@/components/table/switch-tab";
import { GridViewIcon, LayoutTable01Icon } from "@hugeicons-pro/core-stroke-standard";
import { Searchbar } from "@/components/table/header/searchbar";
import PageTableHeader from "@/components/table/header";

const CURSOR_LIMIT = 10;

type ViewMode = "table" | "cards";

const CATEGORY_STYLES = [
  "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
];

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}

function formatPrice(value: number) {
  return `${value.toLocaleString("ar-IQ")} د.ع`;
}

function shortDescription(text: string | null | undefined, max = 45) {
  if (!text?.trim()) return "—";
  const clean = text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max)}…`;
}

function getProductCategories(product: ProductListItem) {
  const cats = product.categories ?? [];
  return cats
    .map((c: any, idx: number) => ({
      id: getCategoryId(c, idx),
      name: getCategoryName(c),
    }))
    .filter((c) => c.name);
}

function getCategoryName(c: any): string {
  return c?.category?.name ?? c?.name ?? "";
}

function getCategoryId(c: any, idx: number): string {
  return c?.category?.id ?? c?.id ?? String(idx);
}

function categoryStyle(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_STYLES[Math.abs(hash) % CATEGORY_STYLES.length];
}

function costMargin(price: number, cost: number) {
  if (!cost || cost <= 0) return null;
  return ((price - cost) / cost) * 100;
}

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem("productsViewMode");
    return saved === "cards" ? "cards" : "table";
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilterValues>({
    categoryIds: [],
    enabled: undefined,
  });
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { data: productStats } = useFetchProductStats();

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
  const publicUrl = import.meta.env.VITE_PUBLIC_URL ?? "";

  const getImageUrl = (image?: string | null) => {
    const defaultImage = "https://imgs.search.brave.com/kkLO9GerXj9XfoUWeX5bKPjdeLdnQpzFoh-TOFjz1rA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMzYv/MDQ5LzExNC9zbWFs/bC9haS1nZW5lcmF0/ZWQtaXNvbGF0ZWQt/Y2hhcmdlci1jdXRv/dXQtb2JqZWN0LW9u/LXRyYW5zcGFyZW50/LWJhY2tncm91bmQt/ZmlsZS1wbmcucG5n"
    return defaultImage;

    console.log("image: ", image);
    if (!image) return undefined;
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    const base =
      (imageBaseUrl && imageBaseUrl.trim()) || publicUrl.trim() || "";
    if (!base) return image;

    const baseNormalized = base.replace(/\/+$/, "");
    const imageNormalized = image.replace(/^\/+/, "");
    return `${baseNormalized}/${imageNormalized}`;
  };

  const hasActiveFilters =
    filters.categoryIds.length > 0 || filters.enabled !== undefined;

  const { data: categoriesData } = useFetchCategories(
    undefined,
    hasActiveFilters || isFilterDialogOpen,
  );

  const categoryMap = new Map<string, string>(
    (Array.isArray(categoriesData?.data)
      ? categoriesData.data
      : Array.isArray(categoriesData)
        ? categoriesData
        : []
    ).map((c: { id: string; name: string }) => [c.id, c.name]),
  );

  const newProductsCount = productStats?.newProducts ?? 0;

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("productsViewMode", mode);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteProduct(deleteId, {
      onSuccess: () => {
        toast.success("تم حذف المنتج بنجاح");
        setDeleteId(null);
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message || "فشل في حذف المنتج. حاول مرة أخرى.",
        );
      },
    });
  };

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

  const renderStatus = (enabled: boolean) => {
    if (enabled) {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          متاح
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        مخفي
      </span>
    );
  };

  const renderCategories = (product: ProductListItem) => {
    const cats = getProductCategories(product);
    if (cats.length === 0) {
      return (
        <span className="text-xs text-muted-foreground">بدون فئة</span>
      );
    }
    return (
      <div className="flex max-w-[180px] flex-wrap gap-1.5">
        {cats.slice(0, 3).map((c) => (
          <span
            key={c.id}
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
              categoryStyle(c.name),
            )}
          >
            {c.name}
          </span>
        ))}
        {cats.length > 3 && (
          <span className="text-xs text-muted-foreground">+{cats.length - 3}</span>
        )}
      </div>
    );
  };

  const thClass = "h-11 px-4 text-right font-semibold text-muted-foreground";
  const tdClass = "whitespace-normal px-4 py-3.5 text-right align-middle";

  const renderProductTable = () => (
    <Card className="overflow-hidden py-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className={cn(thClass, "w-14")}>#</TableHead>
            <TableHead className={cn(thClass, "w-16")}>الصورة</TableHead>
            <TableHead className={cn(thClass, "min-w-[220px]")}>معلومات المنتج</TableHead>
            <TableHead className={cn(thClass, "min-w-[160px]")}>الفئات</TableHead>
            <TableHead className={thClass}>السعر</TableHead>
            <TableHead className={thClass}>تكلفة المنتج</TableHead>
            <TableHead className={cn(thClass, "w-20")}>التقييم</TableHead>
            <TableHead className={cn(thClass, "w-24")}>الحالة</TableHead>
            <TableHead className={cn(thClass, "w-28")}>العمليات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => {
            const margin = costMargin(product.price, product.cost_to_produce);
            return (
              <TableRow
                key={product.id}
                className="cursor-pointer hover:bg-muted/30"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <TableCell className={cn(tdClass, "text-muted-foreground")}>
                  {String(index + 1).padStart(2, "0")}
                </TableCell>
                <TableCell className={tdClass}>
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
                    {product.image ? (
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.title}
                        className="size-full object-contain p-1"
                      />
                    ) : (
                      <Package className="size-5 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell className={tdClass}>
                  <p className="font-semibold leading-snug">{product.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {shortDescription(product.description, 40)}
                  </p>
                </TableCell>
                <TableCell className={tdClass}>{renderCategories(product)}</TableCell>
                <TableCell className={cn(tdClass, "font-medium tabular-nums")}>
                  {formatPrice(product.price)}
                </TableCell>
                <TableCell className={tdClass}>
                  <p className="font-medium tabular-nums">
                    {product.cost_to_produce
                      ? formatPrice(product.cost_to_produce)
                      : "—"}
                  </p>
                  {margin !== null && (
                    <p
                      className={cn(
                        "mt-0.5 text-xs font-medium tabular-nums",
                        margin >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400",
                      )}
                    >
                      {Math.abs(margin).toFixed(1)}% {margin >= 0 ? "↑" : "↓"}
                    </p>
                  )}
                </TableCell>
                <TableCell className={tdClass}>
                  {typeof product.rate === "number" ? (
                    <div className="flex items-center justify-end gap-1">
                      <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm tabular-nums">
                        {product.rate.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className={tdClass}>{renderStatus(product.enabled)}</TableCell>
                <TableCell className={tdClass}>
                  <div
                    className="flex items-center justify-end gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => navigate(`/products/${product.id}`)}
                      title="عرض"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                      title="تعديل"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleteId(product.id)}
                      title="حذف"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );

  const renderProductCard = (product: ProductListItem) => (
    <Link key={product.id} to={`/products/${product.id}`}>
      <Card className="group h-full cursor-pointer gap-y-0 transition-all hover:border-primary/25 hover:shadow-lg">
        <CardHeader className="pb-4">
          <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-lg bg-muted/40">
            {product.image ? (
              <img
                src={getImageUrl(product.image)}
                alt={product.title}
                className="h-full w-full object-contain"
              />
            ) : (
              <ShoppingCart className="size-12 rounded-full bg-cyan/20 p-3 text-cyan" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <CardTitle className="line-clamp-2 text-right leading-8">
            {product.title}
          </CardTitle>
          <p className="line-clamp-1 text-right text-sm text-muted-foreground">
            {shortDescription(product.description, 60)}
          </p>
          {typeof product.rate === "number" ? (
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {product.rate.toFixed(1)}
              </span>
            </div>
          ) : null}
          <div className="mb-2 flex flex-wrap gap-2">{renderCategories(product)}</div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t pt-2">
          <span className="text-lg font-bold text-primary">
            {typeof product.price === "number"
              ? formatPrice(product.price)
              : "—"}
          </span>
          {renderStatus(product.enabled)}
        </CardFooter>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Package
              className="size-7 shrink-0 text-[#2563eb] dark:text-[#60a5fa]"
              strokeWidth={1.75}
            />
            <h1 className="page-title text-[#1e3a8a] dark:text-[#93c5fd]">
              المنتجات
            </h1>
          </div>
          <Button
            className="h-11 shrink-0 gap-2.5 rounded-full bg-[#00b7ff] px-5 text-white shadow-sm hover:bg-[#00a3e6]"
            onClick={() => navigate("/products/add")}
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-white/25">
              <Plus className="size-4" strokeWidth={2.5} />
            </span>
            إضافة منتج جديد
          </Button>
        </div>
        <p className="text-sm leading-relaxed">
          <span className="text-[#64748b] dark:text-muted-foreground">
            تمتلك{" "}
          </span>
          <span className="font-semibold text-[#00b7ff]">
            {newProductsCount} حركة جديدة
          </span>
          <span className="text-[#64748b] dark:text-muted-foreground">
            {" "}
            في قائمة{" "}
          </span>
          <span className="text-[#64748b] underline decoration-[#94a3b8]/60 underline-offset-[3px] dark:text-muted-foreground">
            المنتجات
          </span>
        </p>
      </div>

      <ProductStatsCards />

      {/* Toolbar — بحث وفلتر */}
      <div className="rounded-2xl border border-[#e8edf3] bg-card p-4 shadow-sm">
        <h2 className="mb-4 text-right text-base font-bold text-[#1e3a8a] dark:text-[#93c5fd]">
          جميع المنتجات
        </h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsFilterDialogOpen(true)}
            className={cn(
              "h-11 shrink-0 gap-2 rounded-xl border-[#e2e8f0] bg-white px-4 font-medium shadow-none hover:bg-[#f8fafc] dark:bg-card",
              hasActiveFilters && "border-[#00b7ff] text-[#00b7ff]",
            )}
          >
            <SlidersHorizontal className="size-4" />
            فلتر
            {hasActiveFilters && (
              <span className="flex size-5 items-center justify-center rounded-full bg-[#00b7ff] text-[10px] text-white">
                {(filters.categoryIds.length || 0) +
                  (filters.enabled !== undefined ? 1 : 0)}
              </span>
            )}
          </Button>

          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]" />
            <Input
              type="search"
              placeholder="ابحث عن المنتجات"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 rounded-xl border-[#e2e8f0] bg-[#f8fafc] pr-11 text-right shadow-none focus-visible:border-[#00b7ff]/50 focus-visible:ring-[#00b7ff]/20 dark:bg-muted/30"
              dir="rtl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="مسح البحث"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1 self-end rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-1 dark:bg-muted/30 sm:self-auto">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-9 gap-1.5 rounded-lg px-3",
                viewMode === "table" && "bg-white shadow-sm",
              )}
              onClick={() => handleViewModeChange("table")}
            >
              <List className="size-4" />
              <span className="hidden sm:inline">جدول</span>
            </Button>
            <Button
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-9 gap-1.5 rounded-lg px-3",
                viewMode === "cards" && "bg-white shadow-sm",
              )}
              onClick={() => handleViewModeChange("cards")}
            >
              <LayoutGrid className="size-4" />
              <span className="hidden sm:inline">بطاقات</span>
            </Button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#e8edf3] pt-3">
            {filters.categoryIds.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-[#00b7ff]/10 px-3 py-1 text-xs font-medium text-[#0077a8]"
              >
                {categoryMap.get(id) ?? "فئة"}
                <button
                  type="button"
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      categoryIds: f.categoryIds.filter((c) => c !== id),
                    }))
                  }
                  className="hover:text-[#00b7ff]"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
            {filters.enabled !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#00b7ff]/10 px-3 py-1 text-xs font-medium text-[#0077a8]">
                {filters.enabled ? "مفعل" : "مخفي"}
                <button
                  type="button"
                  onClick={() =>
                    setFilters((f) => ({ ...f, enabled: undefined }))
                  }
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() =>
                setFilters({ categoryIds: [], enabled: undefined })
              }
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              مسح الكل
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading && products.length === 0 ? (
        <ProductsSkeleton count={8} showHeader={false} viewMode={viewMode} />
      ) : error && products.length === 0 ? (
        <ErrorPage
          error={error}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : products.length === 0 ? (
        <EmptyPage
          title={
            debouncedQuery || hasActiveFilters ? "لا توجد نتائج" : "لا توجد منتجات"
          }
          description={
            debouncedQuery || hasActiveFilters
              ? "لم يتم العثور على منتجات تطابق البحث أو التصفية."
              : "ابدأ بإضافة منتج جديد لعرضه هنا."
          }
          icon={<ShoppingCart className="size-7 text-muted-foreground" />}
          primaryAction={
            debouncedQuery || hasActiveFilters
              ? {
                label: "مسح البحث والتصفية",
                onClick: () => {
                  setSearchQuery("");
                  setFilters({ categoryIds: [], enabled: undefined });
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
      ) : viewMode === "table" ? (
        renderProductTable()
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map(renderProductCard)}
        </div>
      )}

      {/* Footer / load more */}
      {products.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            عرض {products.length} منتج
            {hasNextPage ? " — المزيد متاح" : ""}
          </p>
          {hasNextPage && (
            <div ref={loadMoreRef}>
              <Button
                variant="outline"
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
            </div>
          )}
        </div>
      )}

      <ProductFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        values={filters}
        onApply={setFilters}
        onClear={() =>
          setFilters({ categoryIds: [], enabled: undefined })
        }
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl" className="text-right">
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle>تأكيد حذف المنتج</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
