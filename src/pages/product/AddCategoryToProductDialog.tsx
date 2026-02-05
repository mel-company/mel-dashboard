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
import { Loader2, Folder, Search, Check } from "lucide-react";
import { useFetchAvailableCategoriesSearchCursor } from "@/api/wrappers/category.wrappers";
import { useAddCategoryToProduct } from "@/api/wrappers/product.wrappers";
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
  productId: string;
  onSuccess?: () => void;
};

const AddCategoryToProductDialog = ({
  open,
  onOpenChange,
  productId,
  onSuccess,
}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 350);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFetchAvailableCategoriesSearchCursor(
      { productId, query: debouncedSearch || undefined, limit: PAGE_SIZE },
      open && !!productId
    );

  const { mutate: addCategory, isPending } = useAddCategoryToProduct();

  // Flatten paginated categories (server-side search) and get baseUrl from first page
  const categories = data?.pages?.flatMap((p) => p.data ?? []) ?? [];
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
  }, [open, hasNextPage, loadMoreCallback, categories.length]);

  // Reset selections when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSelectedCategoryIds([]);
    }
  }, [open]);

  // Search is server-side via useFetchAvailableCategoriesSearchCursor
  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = () => {
    if (selectedCategoryIds.length === 0) {
      toast.error("الرجاء اختيار فئة واحدة على الأقل");
      return;
    }

    addCategory(
      { id: productId, categoryIds: selectedCategoryIds },
      {
        onSuccess: () => {
          toast.success("تم إضافة الفئات إلى المنتج بنجاح");
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "فشل في إضافة الفئة. حاول مرة أخرى."
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
            <Folder className="size-5" />
            إضافة فئة إلى المنتج
          </DialogTitle>
          <DialogDescription className="text-right">
            اختر الفئات التي تريد إضافتها إلى هذا المنتج
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ابحث عن فئة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Categories List */}
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
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                {debouncedSearch
                  ? "لا توجد فئات تطابق البحث"
                  : "لا توجد فئات متاحة للإضافة"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category: any) => {
                const isSelected = selectedCategoryIds.includes(category.id);
                return (
                  <div
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-input bg-card hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-muted shrink-0 overflow-hidden">
                      {category.image ? (
                        <img
                          src={`${baseUrl}/${category.image}`}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Folder className="size-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-semibold line-clamp-1">
                        {category.name}
                      </p>
                      {category.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {category.description}
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
        {selectedCategoryIds.length > 0 && (
          <div className="text-sm text-muted-foreground text-right border-t pt-2">
            تم اختيار {selectedCategoryIds.length} فئة
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
            disabled={isPending || selectedCategoryIds.length === 0}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الإضافة...
              </>
            ) : (
              <>
                <Folder className="size-4" />
                إضافة الفئات ({selectedCategoryIds.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryToProductDialog;
