import { Searchbar } from './searchbar'
import { FilterHorizontalIcon } from '@hugeicons-pro/core-twotone-rounded';
import { HugeiconsIcon } from '@hugeicons/react';

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
        <header className='flex flex-col sm:flex-row gap-2 sm:items-center justify-between'>
            {title ? (
                <div className="min-w-0 text-right">
                    <h2 className='text-2xl text-blue-950 dark:text-blue-100'>{title}</h2>
                    {subtitle ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {subtitle}
                        </p>
                    ) : null}
                </div>
            ) : (
                <div />
            )}
            <div className='flex items-center gap-2.5'>
                <Searchbar
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder={searchPlaceholder}
                />
                <button
                    onClick={onFilterClick}
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-white text-sky-800"
                >
                    <HugeiconsIcon icon={FilterHorizontalIcon} size={20} />
                    فلاتر
                    {hasActiveFilters &&
                        <span
                            className="ml-2 bg-blue-100 aspect-square text-blue-700 text-xs w-5 h-5 p-0.5 rounded-full">
                            {activeFilterCount}
                        </span>
                    }
                </button>

                {children && <div className='h-6 w-px bg-slate-200' />}
                {children}
            </div>

        </header>
    )
}

export default PageTableHeader
