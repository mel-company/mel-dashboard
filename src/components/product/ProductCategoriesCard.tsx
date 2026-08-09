import { useRef, useState } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DashedTag, ProductSectionCard } from "@/components/product/tags";

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
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <ProductSectionCard title="أصناف المنتج الأساسي" label="أختيار الاصناف">
      <div className="relative mb-3" dir="rtl">
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            searchRef.current?.focus();
          }}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
          aria-label="فتح القائمة"
        >
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </button>
        <Input
          ref={searchRef}
          type="search"
          placeholder="البحث عن الاصناف المناسبة"
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // allow click on list item
            window.setTimeout(() => setOpen(false), 150);
          }}
          className="h-11 rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-right shadow-none placeholder:text-slate-400 focus-visible:border-sky-300 focus-visible:ring-sky-100 dark:border-slate-700 dark:bg-slate-900"
          dir="rtl"
        />

        {open ? (
          <div className="absolute inset-x-0 top-[calc(100%+0.35rem)] z-20 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
            {isLoading && categories.length === 0 ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 rounded-xl" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                {searchQuery.trim() ? "لا توجد نتائج" : "ابحث لإضافة أصناف"}
              </p>
            ) : (
              <div className="max-h-44 space-y-0.5 overflow-y-auto p-1.5">
                {categories.map((category) => {
                  const isSelected = selected.some((c) => c.id === category.id);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onToggle(category.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-right text-sm transition",
                        isSelected
                          ? "bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:text-sky-200"
                          : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/4",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-5 items-center justify-center rounded-md border",
                          isSelected
                            ? "border-sky-500 bg-sky-500 text-white"
                            : "border-slate-300 dark:border-slate-600",
                        )}
                      >
                        {isSelected ? <Check className="size-3" /> : null}
                      </span>
                      <span className="font-medium">{category.name}</span>
                    </button>
                  );
                })}
                <div ref={loadMoreRef} className="py-1 text-center">
                  {hasMore ? (
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
                  ) : null}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2" dir="rtl">
          {selected.map((cat) => (
            <DashedTag key={cat.id} onRemove={() => onToggle(cat.id)}>
              {cat.name}
            </DashedTag>
          ))}
        </div>
      ) : (
        <p className="py-2 text-center text-xs text-slate-400">
          لم يتم اختيار أصناف بعد
        </p>
      )}
    </ProductSectionCard>
  );
}
