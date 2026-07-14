import { Search, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  AddedLabel,
  DashedTag,
  ProductSectionCard,
} from "@/components/product/tags";

export type CategoryChip = {
  id: string;
  name: string;
};

type ProductCategoriesCardProps = {
  productTitle?: string;
  selected: CategoryChip[];
  categories: Array<{ id: string; name: string; description?: string }>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onToggle: (id: string) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
};

export function ProductCategoriesCard({
  productTitle,
  selected,
  categories,
  searchQuery,
  onSearchChange,
  onToggle,
  isLoading,
  hasMore,
  isLoadingMore,
  onLoadMore,
  loadMoreRef,
}: ProductCategoriesCardProps) {
  return (
    <ProductSectionCard title="الاصناف" label="الاصناف">
      <div className="mb-3 rounded-2xl bg-slate-100 px-4 py-3 text-right text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">
        {productTitle?.trim() || "اسم المنتج يظهر هنا"}
      </div>

        {selected.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
            <AddedLabel />
            {selected.map((cat) => (
              <DashedTag key={cat.id} onRemove={() => onToggle(cat.id)}>
                {cat.name}
              </DashedTag>
            ))}
          </div>
        )}

      <div className="relative mb-3">
        <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="ابحث عن صنف..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rounded-2xl border-0 bg-slate-50 pr-10 text-right dark:bg-slate-900"
          dir="rtl"
        />
      </div>

      {isLoading && categories.length === 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 rounded-2xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {searchQuery.trim() ? "لا توجد نتائج" : "لا توجد أصناف"}
        </p>
      ) : (
        <div className="max-h-52 space-y-2 overflow-y-auto">
          {categories.map((category) => {
            const isSelected = selected.some((c) => c.id === category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onToggle(category.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-right text-sm transition",
                  isSelected
                    ? "border-sky-400 bg-sky-50 dark:bg-sky-950/30"
                    : "border-transparent bg-slate-50 hover:bg-slate-100 dark:bg-slate-900",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded border",
                    isSelected
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-slate-300",
                  )}
                >
                  {isSelected ? <Check className="size-3" /> : null}
                </span>
                <span className="font-medium">{category.name}</span>
              </button>
            );
          })}
          <div ref={loadMoreRef} className="py-1 text-center">
            {hasMore && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isLoadingMore}
                onClick={onLoadMore}
              >
                {isLoadingMore ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "تحميل المزيد"
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </ProductSectionCard>
  );
}
