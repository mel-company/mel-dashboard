import { HugeiconsIcon } from "@hugeicons/react";
import {
  FilterIcon,
  Search01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { cn } from "@/lib/utils";

type NotificationsToolbarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void;
  onFilterClick: () => void;
  hasActiveFilters?: boolean;
  activeFilterCount?: number;
  showFilterLabel?: boolean;
  className?: string;
};

const NotificationsToolbar = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onFilterClick,
  hasActiveFilters = false,
  activeFilterCount = 0,
  showFilterLabel = false,
  className,
}: NotificationsToolbarProps) => {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-[14px] border px-2 sm:max-w-[402px]",
          "border-[#00b7ff26] bg-card",
        )}
      >
        <button
          type="button"
          onClick={() => onSearchSubmit?.()}
          className="shrink-0 rounded-lg bg-[#00b7ff0d] px-3.5 py-2 text-sm font-medium text-primary"
        >
          البحث
        </button>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearchSubmit?.();
          }}
          placeholder="ابحث عن المنتجات"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <HugeiconsIcon
          icon={Search01Icon}
          size={22}
          className="me-1 shrink-0 text-muted-foreground"
        />
      </div>

      <button
        type="button"
        onClick={onFilterClick}
        aria-label="الفلاتر"
        className={cn(
          "relative flex h-12 shrink-0 items-center justify-center gap-2 rounded-[14px] border border-[#00b7ff26] bg-card px-3.5 text-primary",
          showFilterLabel ? "min-w-[110px]" : "size-12 px-0",
        )}
      >
        {showFilterLabel ? (
          <span className="text-sm font-bold">الفلاتر</span>
        ) : null}
        <HugeiconsIcon icon={FilterIcon} size={22} />
        {hasActiveFilters && activeFilterCount > 0 ? (
          <span className="absolute -start-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#ff0808] px-1 text-[10px] font-bold leading-none text-white shadow-[0_0_25px_#ff080833]">
            +{activeFilterCount}
          </span>
        ) : null}
      </button>
    </div>
  );
};

export default NotificationsToolbar;
