import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import FilterSlidersIcon from "@/components/icons/FilterSlidersIcon";

type NotificationsToolbarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void;
  onFilterClick: () => void;
  hasActiveFilters?: boolean;
  activeFilterCount?: number;
  className?: string;
};

const NotificationsToolbar = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onFilterClick,
  hasActiveFilters = false,
  activeFilterCount = 0,
  className,
}: NotificationsToolbarProps) => {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-2xl border px-3",
          "border-slate-200 bg-white",
          "dark:border-slate-700 dark:bg-slate-900",
        )}
      >
        <Search className="size-5 shrink-0 text-sky-500" strokeWidth={2.25} />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearchSubmit?.();
          }}
          placeholder="ابحث عن المنتجات"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={() => onSearchSubmit?.()}
          className="shrink-0 px-1 text-sm font-semibold text-sky-500"
        >
          البحث
        </button>
      </div>

      <button
        type="button"
        onClick={onFilterClick}
        aria-label="الفلاتر"
        className={cn(
          "relative flex size-12 shrink-0 items-center justify-center rounded-2xl border",
          "border-slate-200 bg-white text-sky-700",
          "dark:border-slate-700 dark:bg-slate-900 dark:text-sky-400",
        )}
      >
        <FilterSlidersIcon
          size={20}
          className="text-[#3B4656] dark:text-sky-400"
        />
        {hasActiveFilters && activeFilterCount > 0 ? (
          <span className="absolute -start-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
            +{activeFilterCount}
          </span>
        ) : null}
      </button>
    </div>
  );
};

export default NotificationsToolbar;
