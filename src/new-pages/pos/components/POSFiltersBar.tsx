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
        <div
          className={cn(
            "flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-2xl border px-2",
            "border-[#00b7ff]/15 bg-white",
            "dark:border-[#00b7ff]/15 dark:bg-[#0a0e27]",
          )}
        >
          <span className="shrink-0 rounded-lg bg-[#00b7ff]/5 px-3.5 py-1.5 text-sm font-medium text-[#00b7ff]">
            البحث
          </span>
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="h-8 min-w-0 flex-1 border-0 bg-transparent px-0 text-right shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <Search className="pointer-events-none me-1 size-4 shrink-0 text-[#91a0b6] dark:text-[#4a5596]" />
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
        className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-violet-500/25 bg-violet-500/10 text-sm font-bold text-violet-700 transition-colors hover:bg-violet-500/15 dark:border-[#9a5cff]/25 dark:bg-[#9a5cff]/10 dark:text-[#b282ff] dark:hover:bg-[#9a5cff]/20"
      >
        عرض جميع القوائم
        <LayoutGrid className="size-4" />
      </button>
    </div>
  );
};

export default POSFiltersBar;
