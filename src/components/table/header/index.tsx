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
                    <h2 className='text-xl text-blue-950 sm:text-2xl dark:text-blue-100'>{title}</h2>
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
                    <button
                        type="button"
                        onClick={onFilterClick}
                        className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-transparent bg-white px-3 py-2 text-sky-800 sm:flex-none dark:border-slate-800 dark:bg-slate-950 dark:text-sky-300"
                    >
                        <FilterSlidersIcon size={20} className="text-[#3B4656] dark:text-sky-300" />
                        فلاتر
                        {hasActiveFilters &&
                            <span
                                className="ms-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                                +{activeFilterCount}
                            </span>
                        }
                    </button>

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
