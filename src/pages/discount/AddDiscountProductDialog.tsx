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
import { Loader2, Package, Search, Check, ShoppingCart } from "lucide-react";
import {
  useAddProductsToDiscount,
  useFetchAvailableProductsSearchCursor,
} from "@/api/wrappers/discount.wrappers";
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
  discountId: string;
  existingProductIds?: string[];
  onSuccess?: () => void;
};

const AddDiscountProductDialog = ({
  open,
  onOpenChange,
  discountId,
  existingProductIds = [],
  onSuccess,
}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 350);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFetchAvailableProductsSearchCursor(
      discountId,
      { query: debouncedSearch || undefined, limit: PAGE_SIZE },
      open && !!discountId
    );

  const { mutate: addProducts, isPending } = useAddProductsToDiscount();

  // Flatten paginated products (server-side search; API already excludes products linked to this discount)
  const products = data?.pages?.flatMap((p) => p.data ?? []) ?? [];
  const baseUrl = data?.pages?.[0]?.baseUrl ?? "";

  // Optionally exclude existingProductIds if passed (e.g. from parent state that hasn't refetched yet)
  const availableProducts =
    existingProductIds.length > 0
      ? products.filter((p: any) => !existingProductIds.includes(p.id))
      : products;

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
      { id: discountId, productIds: selectedProductIds },
      {
        onSuccess: () => {
          toast.success("تم إضافة المنتجات إلى الخصم بنجاح");
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
            <Package className="size-5" />
            إضافة منتجات إلى الخصم
          </DialogTitle>
          <DialogDescription className="text-right">
            اختر المنتجات التي تريد إضافتها إلى هذا الخصم
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
          ) : availableProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                {debouncedSearch
                  ? "لا توجد منتجات تطابق البحث"
                  : "لا توجد منتجات متاحة للإضافة"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableProducts.map((product: any) => {
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
                    <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-muted shrink-0 overflow-hidden">
                      {product.image ? (
                        <img
                          src={`${baseUrl}/${product.image}`}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingCart className="size-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-semibold line-clamp-1">
                        {product.title}
                      </p>
                      {product.price && (
                        <p className="text-sm text-muted-foreground">
                          {product.price.toFixed(2)} د.ع
                        </p>
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
                <Package className="size-4" />
                إضافة المنتجات ({selectedProductIds.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddDiscountProductDialog;
