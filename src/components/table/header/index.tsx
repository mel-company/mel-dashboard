import { Searchbar } from './searchbar'
import FilterSlidersIcon from '@/components/icons/FilterSlidersIcon';

interface PageTableHeaderProps {
    title?: string;
    subtitle?: string;
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    onFilterClick?: () => void;
    hasActiveFilters?: boolean;
    activeFilterCount?: number;
    children?: React.ReactNode;
}

const PageTableHeader = ({
    title = "المنتجات",
    subtitle,
    searchQuery = "",
    onSearchChange,
    searchPlaceholder,
    onFilterClick,
    hasActiveFilters = false,
    activeFilterCount = 0,
    children
}: PageTableHeaderProps) => {
    return (
        <header className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2'>
            {title ? (
                <div className="min-w-0 text-right">
                    <h2 className='text-xl text-[#3b4656] sm:text-[20px] dark:text-[#e4e7fc]'>{title}</h2>
                    {subtitle ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {subtitle}
                        </p>
                    ) : null}
                </div>
            ) : (
                <div className="hidden sm:block" />
            )}
            <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2.5'>
                <div className="min-w-0 flex-1 sm:max-w-xs [&_[data-slot=field]]:max-w-none">
                    <Searchbar
                        value={searchQuery}
                        onChange={onSearchChange}
                        placeholder={searchPlaceholder}
                    />
                </div>
                <div className="flex items-center gap-2">
                    {onFilterClick ? (
                    <button
                        type="button"
                        onClick={onFilterClick}
                        className="relative flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[14px] border border-[#00b7ff]/15 bg-white px-3.5 py-2 text-[#00b7ff] sm:flex-none dark:border-[#00b7ff]/15 dark:bg-[#0a0e27] dark:text-[#33c5ff]"
                    >
                        <FilterSlidersIcon size={20} className="text-[#00b7ff] dark:text-[#33c5ff]" />
                        <span className="text-[15px] font-bold">الفلاتر</span>
                        {hasActiveFilters && activeFilterCount > 0 ? (
                            <span
                                className="absolute -start-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#ff0808] px-1 text-[10px] font-bold leading-none text-white shadow-[0_0_12px_rgba(255,8,8,0.2)]"
                            >
                                +{activeFilterCount}
                            </span>
                        ) : null}
                    </button>
                    ) : null}

                    {children && <div className='hidden h-6 w-px bg-slate-200 sm:block dark:bg-slate-700' />}
                    {children ? (
                        <div className="flex flex-1 items-center gap-2 sm:flex-none [&_button]:min-h-11">
                            {children}
                        </div>
                    ) : null}
                </div>
            </div>
        </header>
    )
}

export default PageTableHeader
