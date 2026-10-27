import { Search, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Category } from "../utils";
import { getDisplayName } from "../utils";

type POSFiltersBarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categories: Category[];
  selectedCategoryId: string | null;
  onCategorySelect: (id: string | null) => void;
  isLoadingCategories: boolean;
};

const chip = (selected: boolean) =>
  cn(
    "inline-flex h-8 shrink-0 items-center rounded-full px-3 text-sm font-medium transition-colors",
    selected
      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
  );

/**
 * Search and one row of categories.
 *
 * The categories wrapped onto as many lines as the store had, under a second
 * «عرض جميع القوائم» button that did the same as «الكل», and beside a
 * «أجمالي العناصر المتاحة» count that was only the products loaded so far.
 */
const POSFiltersBar = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategoryId,
  onCategorySelect,
  isLoadingCategories,
}: POSFiltersBarProps) => {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث باسم المنتج"
          className="h-11 rounded-xl border-slate-200 bg-white ps-9 pe-9 text-right shadow-none dark:border-slate-800 dark:bg-slate-950"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute end-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label="مسح البحث"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="custom-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => onCategorySelect(null)}
          className={chip(selectedCategoryId === null)}
        >
          الكل
        </button>
        {isLoadingCategories
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 shrink-0 rounded-full" />
            ))
          : categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategorySelect(category.id)}
                className={chip(selectedCategoryId === category.id)}
              >
                {getDisplayName(category.name)}
              </button>
            ))}
      </div>
    </div>
  );
};

export default POSFiltersBar;
