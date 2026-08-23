import { LayoutGrid, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Category } from "../utils";
import { getDisplayName, resolvePosImageUrl } from "../utils";

type POSFiltersBarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categories: Category[];
  selectedCategoryId: string | null;
  onCategorySelect: (id: string | null) => void;
  isLoadingCategories: boolean;
  imageBaseUrl?: string;
  productCount?: number;
};

const POSFiltersBar = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategoryId,
  onCategorySelect,
  isLoadingCategories,
  imageBaseUrl = "",
  productCount = 0,
}: POSFiltersBarProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative min-w-0 flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="h-11 rounded-2xl border-0 bg-slate-100 pr-4 pl-11 text-right shadow-none focus-visible:ring-sky-500/30 dark:bg-slate-900"
          />
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-sky-500" />
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
            المنتجات
          </p>
          <p className="text-xs text-slate-500">
            أجمالي العناصر المتاحة {productCount}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => onCategorySelect(null)}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors",
            selectedCategoryId === null
              ? "bg-sky-500 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200",
          )}
        >
          الكل
        </button>
        {isLoadingCategories
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))
          : categories.map((category) => {
              const imageSrc = resolvePosImageUrl(category.image, imageBaseUrl);
              const selected = selectedCategoryId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onCategorySelect(category.id)}
                  className={cn(
                    "inline-flex h-9 max-w-[160px] items-center gap-2 truncate rounded-full px-3.5 text-sm font-medium transition-colors",
                    selected
                      ? "bg-sky-500 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200",
                  )}
                >
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt=""
                      className="size-5 shrink-0 rounded-full object-cover"
                    />
                  ) : null}
                  <span className="truncate">{getDisplayName(category.name)}</span>
                </button>
              );
            })}
      </div>

      <button
        type="button"
        onClick={() => onCategorySelect(null)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-violet-600/90 text-sm font-bold text-white hover:bg-violet-600"
      >
        عرض جميع القوائم
        <LayoutGrid className="size-4" />
      </button>
    </div>
  );
};

export default POSFiltersBar;
