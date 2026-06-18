import { useEffect, useRef, useState } from 'react'

export interface UseTableHeaderParams {
    onSearchChange?: (search: string) => void;
    onFilterChange?: (filters: Record<string, any>) => void;
    initialSearch?: string;
    initialFilters?: Record<string, any>;
}

export interface UseTableHeaderReturn {
    search: string;
    setSearchValue: (value: string) => void;
    filters: Record<string, any>;
    setFilters: (filters: Record<string, any>) => void;
    loading: boolean;
    debouncedSearch: string;
}

const useTableHeader = ({
    onSearchChange,
    onFilterChange,
    initialSearch = '',
    initialFilters = {},
}: UseTableHeaderParams): UseTableHeaderReturn => {
    const [search, setSearchValue] = useState(initialSearch);
    const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setDebouncedSearch(search);
            onSearchChange?.(search);
        }, 300);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [search, onSearchChange]);

    useEffect(() => {
        onFilterChange?.(filters);
    }, [filters, onFilterChange]);

    return {
        search,
        setSearchValue,
        filters,
        setFilters,
        loading: false,
        debouncedSearch,
    };
};

export default useTableHeader;
