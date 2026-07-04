import { Skeleton } from "@/components/ui/skeleton";
import { Searchbar } from "@/components/table/header/searchbar";
import { cn } from "@/lib/utils";
import type { Category } from "../utils";
import { getCategoryName, resolvePosImageUrl } from "../utils";

type POSFiltersBarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categories: Category[];
  selectedCategoryId: string | null;
  onCategorySelect: (id: string | null) => void;
  isLoadingCategories: boolean;
  imageBaseUrl?: string;
};

const POSFiltersBar = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategoryId,
  onCategorySelect,
  isLoadingCategories,
  imageBaseUrl = "",
}: POSFiltersBarProps) => {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Searchbar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="ابحث عن منتج..."
        />
        <p className="text-sm text-muted-foreground lg:text-left">
          اختر فئة أو ابحث لإضافة المنتجات للسلة
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCategorySelect(null)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            selectedCategoryId === null
              ? "bg-sky-500 text-white shadow-sm"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200",
          )}
        >
          الكل
        </button>
        {isLoadingCategories
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))
          : categories.map((category) => {
              const imageSrc = resolvePosImageUrl(category.image, imageBaseUrl);
              return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategorySelect(category.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  selectedCategoryId === category.id
                    ? "bg-sky-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                )}
              >
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt=""
                    className="size-6 shrink-0 rounded-full border border-white/40 object-cover"
                  />
                ) : null}
                {getCategoryName(category)}
              </button>
            );
            })}
      </div>
    </div>
  );
};

export default POSFiltersBar;
