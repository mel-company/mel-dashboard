import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, SlidersHorizontal, List, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "table" | "cards";

interface ProductsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onClearFilters: () => void;
  filterTags: Array<{ id: string; label: string; onRemove: () => void }>;
}

const ProductsToolbar = ({
  searchQuery,
  onSearchChange,
  onFilterClick,
  hasActiveFilters,
  activeFilterCount,
  viewMode,
  onViewModeChange,
  onClearFilters,
  filterTags,
}: ProductsToolbarProps) => {
  return (
    <div className="rounded-2xl border border-[#e8edf3] bg-card p-4 shadow-sm">
      <h2 className="mb-4 text-right text-base font-bold text-[#1e3a8a] dark:text-[#93c5fd]">
        جميع المنتجات
      </h2>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          onClick={onFilterClick}
          className={cn(
            "h-11 shrink-0 gap-2 rounded-xl border-[#e2e8f0] bg-white px-4 font-medium shadow-none hover:bg-[#f8fafc] dark:bg-card",
            hasActiveFilters && "border-[#00b7ff] text-[#00b7ff]",
          )}
        >
          <SlidersHorizontal className="size-4" />
          فلتر
          {hasActiveFilters && (
            <span className="flex size-5 items-center justify-center rounded-full bg-[#00b7ff] text-[10px] text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]" />
          <Input
            type="search"
            placeholder="ابحث عن المنتجات"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 rounded-xl border-[#e2e8f0] bg-[#f8fafc] pr-11 text-right shadow-none focus-visible:border-[#00b7ff]/50 focus-visible:ring-[#00b7ff]/20 dark:bg-muted/30"
            dir="rtl"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="مسح البحث"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 self-end rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-1 dark:bg-muted/30 sm:self-auto">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-9 gap-1.5 rounded-lg px-3",
              viewMode === "table" && "bg-white shadow-sm",
            )}
            onClick={() => onViewModeChange("table")}
          >
            <List className="size-4" />
            <span className="hidden sm:inline">جدول</span>
          </Button>
          <Button
            variant={viewMode === "cards" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-9 gap-1.5 rounded-lg px-3",
              viewMode === "cards" && "bg-white shadow-sm",
            )}
            onClick={() => onViewModeChange("cards")}
          >
            <LayoutGrid className="size-4" />
            <span className="hidden sm:inline">بطاقات</span>
          </Button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#e8edf3] pt-3">
          {filterTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-full bg-[#00b7ff]/10 px-3 py-1 text-xs font-medium text-[#0077a8]"
            >
              {tag.label}
              <button
                type="button"
                onClick={tag.onRemove}
                className="hover:text-[#00b7ff]"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            مسح الكل
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsToolbar;
