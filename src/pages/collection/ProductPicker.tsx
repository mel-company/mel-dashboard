import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, Package, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/format-currency";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export { PAGE_SIZE as PRODUCT_PICKER_PAGE_SIZE };

export interface ProductPickerQuery {
  data: any;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

/**
 * Pick products, with server-side search and infinite scroll.
 *
 * One component for both callers, because they differ only in *which* list
 * they page through and there is no third thing:
 *
 *  - creating a collection has no id yet, so it pages the whole catalogue;
 *  - adding to an existing one pages `/collection/:id/product/available`,
 *    which already excludes what the collection holds.
 *
 * The category feature has two near-identical copies of this and they have
 * already drifted — one keeps its selection across a search, the other does
 * not.
 *
 * Selection survives searching and paging here. A merchant building "صيفي"
 * types a word, ticks two things, types another word, and expects the first
 * two to still be ticked; a list that resets on every keystroke makes the
 * feature usable only for products that share a name.
 */
export const ProductPicker = ({
  query,
  searchQuery,
  onSearchChange,
  selectedIds,
  onToggle,
  emptyLabel = "لا توجد منتجات متاحة للإضافة",
}: {
  query: ProductPickerQuery;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedIds: string[];
  onToggle: (productId: string) => void;
  emptyLabel?: string;
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  const products: any[] = data?.pages?.flatMap((page: any) => page?.data ?? []) ?? [];
  const baseUrl: string = data?.pages?.[0]?.baseUrl ?? "";

  const imageUrl = (image?: string | null) => {
    if (!image) return undefined;
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    return baseUrl ? `${baseUrl}/${image}` : image;
  };

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // The sentinel is scoped to the scroll container, not the viewport — the
  // list lives inside a dialog that does not scroll the page.
  useEffect(() => {
    const el = loadMoreRef.current;
    const root = scrollContainerRef.current;
    if (!el || !root || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root, rootMargin: "100px", threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, loadMore, products.length]);

  return (
    <>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="ابحث عن منتج..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pr-10"
        />
      </div>

      <div
        ref={scrollContainerRef}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto"
      >
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg border p-3">
                <Skeleton className="size-16 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="mx-auto mb-4 size-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "لا توجد منتجات تطابق البحث" : emptyLabel}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {products.map((product: any) => {
              const isSelected = selectedIds.includes(product.id);
              return (
                <div
                  key={product.id}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => onToggle(product.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onToggle(product.id);
                    }
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-input bg-card hover:bg-accent",
                  )}
                >
                  <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-[#12183b]">
                    {product.image ? (
                      <img
                        src={imageUrl(product.image)}
                        alt={product.title}
                        className="size-full object-cover"
                      />
                    ) : (
                      <Package className="size-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="line-clamp-1 font-semibold">{product.title}</p>
                    {product.price ? (
                      <span className="text-sm font-medium text-muted-foreground">
                        {formatCurrency(product.price)}
                      </span>
                    ) : null}
                  </div>
                  <div
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded border-2 transition-all",
                      isSelected ? "border-primary bg-primary" : "border-input",
                    )}
                  >
                    {isSelected ? (
                      <Check className="size-3 text-primary-foreground" />
                    ) : null}
                  </div>
                </div>
              );
            })}
            {hasNextPage ? (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="gap-2"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      جاري تحميل المزيد...
                    </>
                  ) : (
                    "تحميل المزيد"
                  )}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
};

export default ProductPicker;
