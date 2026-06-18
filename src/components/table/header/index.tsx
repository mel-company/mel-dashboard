import { Searchbar } from './searchbar'
import { Button } from "@/components/ui/button"
import { X, LayoutGrid, Table as TableIcon } from "lucide-react"

interface PageTableHeaderProps {
    title?: string;
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    onFilterClick?: () => void;
    hasActiveFilters?: boolean;
    activeFilterCount?: number;
    viewMode?: "table" | "cards";
    onViewModeChange?: (mode: "table" | "cards") => void;
    onClearFilters?: () => void;
    filterTags?: any[];
    children?: React.ReactNode;
}

const PageTableHeader = ({
    title = "المنتجات",
    searchQuery = "",
    onSearchChange,
    onFilterClick,
    hasActiveFilters = false,
    activeFilterCount = 0,
    viewMode = "table",
    onViewModeChange,
    onClearFilters,
    filterTags = [],
    children
}: PageTableHeaderProps) => {
    return (
        <header className='flex flex-col sm:flex-row gap-2 sm:items-center justify-between'>
            <h2 className='text-2xl text-blue-950 dark:text-blue-100'>{title}</h2>
            <div className='flex items-center gap-2.5'>
                <Searchbar
                    value={searchQuery}
                    onChange={onSearchChange}
                />
                <Button
                    variant="outline"
                    onClick={onFilterClick}
                    className={hasActiveFilters ? "bg-blue-50 border-blue-200" : ""}
                >
                    {hasActiveFilters && <span className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>}
                    فلاتر
                </Button>
                {onViewModeChange && (
                    <div className="flex items-center border rounded-md">
                        <Button
                            variant={viewMode === "table" ? "secondary" : "ghost"}
                            size="sm"
                            className="rounded-r-md rounded-l-none h-8"
                            onClick={() => onViewModeChange("table")}
                        >
                            <TableIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "cards" ? "secondary" : "ghost"}
                            size="sm"
                            className="rounded-l-md rounded-r-none h-8"
                            onClick={() => onViewModeChange("cards")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                {hasActiveFilters && onClearFilters && (
                    <Button variant="ghost" size="sm" onClick={onClearFilters}>
                        <X className="h-4 w-4 ml-2" />
                        مسح الفلاتر
                    </Button>
                )}
                {children && <div className='h-7 w-px bg-slate-200' />}
                {children}
            </div>
            {filterTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {filterTags.map((tag) => (
                        <div
                            key={tag.id}
                            className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md text-sm"
                        >
                            {tag.label}
                            <button
                                onClick={tag.onRemove}
                                className="hover:text-blue-900 dark:hover:text-blue-100"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </header>
    )
}

export default PageTableHeader