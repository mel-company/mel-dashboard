import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShoppingCart, Search, Check, DollarSign } from "lucide-react";
import { useFetchAvailableProductsSearchCursor } from "@/api/wrappers/category.wrappers";
import { useAddProductsToCategory } from "@/api/wrappers/category.wrappers";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 20;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debouncedValue;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  onSuccess?: () => void;
};

const AddProductToCategoryDialog = ({
  open,
  onOpenChange,
  categoryId,
  onSuccess,
}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 350);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFetchAvailableProductsSearchCursor(
      categoryId,
      { query: debouncedSearch || undefined, limit: PAGE_SIZE },
      open && !!categoryId
    );

  const { mutate: addProducts, isPending } = useAddProductsToCategory();

  // Flatten paginated products (server-side search) and get baseUrl from first page
  const products = data?.pages?.flatMap((p) => p.data ?? []) ?? [];
  const baseUrl = data?.pages?.[0]?.baseUrl ?? "";

  // Infinite scroll: load more when sentinel enters viewport
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadMoreCallback = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = loadMoreRef.current;
    const root = scrollContainerRef.current;
    if (!el || !root || !open || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMoreCallback();
      },
      { root, rootMargin: "100px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [open, hasNextPage, loadMoreCallback, products.length]);

  // Reset selections when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSelectedProductIds([]);
    }
  }, [open]);

  // Search is server-side via useFetchAvailableProductsSearchCursor; no client filter
  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = () => {
    if (selectedProductIds.length === 0) {
      toast.error("الرجاء اختيار منتج واحد على الأقل");
      return;
    }

    addProducts(
      { id: categoryId, productIds: selectedProductIds },
      {
        onSuccess: () => {
          toast.success("تم إضافة المنتجات إلى الفئة بنجاح");
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "فشل في إضافة المنتجات. حاول مرة أخرى."
          );
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right flex items-center gap-2">
            <ShoppingCart className="size-5" />
            إضافة منتجات إلى الفئة
          </DialogTitle>
          <DialogDescription className="text-right">
            اختر المنتجات التي تريد إضافتها إلى هذه الفئة
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ابحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Products List */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto space-y-2 min-h-0"
        >
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <Skeleton className="size-16 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                {debouncedSearch
                  ? "لا توجد منتجات تطابق البحث"
                  : "لا توجد منتجات متاحة للإضافة"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((product: any) => {
                const isSelected = selectedProductIds.includes(product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-input bg-card hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-dark-blue/10 shrink-0 overflow-hidden">
                      {product.image ? (
                        <img
                          src={`${baseUrl}/${product.image}`}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingCart className="size-8 text-white bg-cyan/40 rounded-full p-2" />
                      )}
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-semibold line-clamp-1">
                        {product.title}
                      </p>
                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                      )}
                      {product.price && (
                        <div className="flex items-center gap-1 mt-1">
                          <DollarSign className="size-3 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {product.price.toLocaleString()} د.ع
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-input"
                      }`}
                    >
                      {isSelected && (
                        <Check className="size-3 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                );
              })}
              {/* Sentinel for infinite scroll + Load more button */}
              {hasNextPage && (
                <div ref={loadMoreRef} className="py-4 flex justify-center">
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
              )}
            </div>
          )}
        </div>

        {/* Selected Count */}
        {selectedProductIds.length > 0 && (
          <div className="text-sm text-muted-foreground text-right border-t pt-2">
            تم اختيار {selectedProductIds.length} منتج
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || selectedProductIds.length === 0}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الإضافة...
              </>
            ) : (
              <>
                <ShoppingCart className="size-4" />
                إضافة المنتجات ({selectedProductIds.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductToCategoryDialog;
