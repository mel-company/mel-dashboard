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
          "border-[#00b7ff]/15 bg-white",
          "dark:border-[#00b7ff]/15 dark:bg-[#0a0e27]",
        )}
      >
        <button
          type="button"
          onClick={() => onSearchSubmit?.()}
          className="shrink-0 rounded-lg bg-[#00b7ff]/5 px-3.5 py-2 text-sm font-medium text-[#00b7ff]"
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
          placeholder="ابحث عن اشعار"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#3b4656] outline-none placeholder:text-[#91a0b6] dark:text-[#e4e7fc] dark:placeholder:text-[#4a5596]"
        />
        <HugeiconsIcon
          icon={Search01Icon}
          size={22}
          className="me-1 shrink-0 text-[#91a0b6] dark:text-[#4a5596]"
        />
      </div>

      <button
        type="button"
        onClick={onFilterClick}
        aria-label="الفلاتر"
        className={cn(
          "relative flex h-12 shrink-0 items-center justify-center gap-2 rounded-[14px] border border-[#00b7ff]/15 bg-white text-[#00b7ff]",
          "dark:border-[#00b7ff]/15 dark:bg-[#0a0e27] dark:text-[#33c5ff]",
          showFilterLabel ? "min-w-[110px] px-3.5" : "size-12 px-0",
        )}
      >
        {showFilterLabel ? (
          <span className="text-sm font-bold">الفلاتر</span>
        ) : null}
        <HugeiconsIcon icon={FilterIcon} size={22} />
        {hasActiveFilters && activeFilterCount > 0 ? (
          <span className="absolute -start-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#ff0808] px-1 text-[10px] font-bold leading-none text-white shadow-[0_0_12px_rgba(255,8,8,0.2)]">
            +{activeFilterCount}
          </span>
        ) : null}
      </button>
    </div>
  );
};

export default NotificationsToolbar;
