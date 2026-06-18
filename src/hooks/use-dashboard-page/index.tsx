import { useState } from "react";
import { usePage } from "@/hooks/pages";
import { useTableData, useInfiniteScroll } from "@/hooks/use-table-data";
import useTableHeader from "@/hooks/table-header";
import { usePageStore } from "@/store/use-page-store";

export interface DashboardPageOptions<TFilters = Record<string, any>> {
  /** Custom limit for pagination */
  limit?: number;
  /** Initial filter values */
  initialFilters?: TFilters;
  /** Enable view mode toggle */
  enableViewMode?: boolean;
  /** Enable delete functionality */
  enableDelete?: boolean;
  /** Custom delete mutation hook */
  deleteMutation?: any;
  /** Custom stats hook */
  statsHook?: any;
}

export interface DashboardPageReturn<TData = any, TFilters = Record<string, any>> {
  // UI State
  isFilterDialogOpen: boolean;
  setIsFilterDialogOpen: (open: boolean) => void;

  // Data
  data: TData[];
  stats?: any;

  // Search
  search: string;
  setSearchValue: (value: string) => void;

  // Filters
  filters: TFilters;
  setFilters: (filters: TFilters) => void;
  hasActiveFilters: boolean;
  handleClearFilters: () => void;

  // View Mode (always returned, but only functional when enabled)
  viewMode: "table" | "cards";
  handleViewModeChange: (mode: "table" | "cards") => void;

  // Delete (always returned, but only functional when enabled)
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
  isDeleting: boolean;
  handleDelete: () => void;

  // Loading States
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  error: Error | null;
  refetch: () => void;
  fetchNextPage: () => void;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;

  // Cache Management
  invalidateCache: (endpoint?: string) => Promise<void>;
}

/**
 * Flexible hook for dashboard pages with common functionality
 * Handles search, filters, pagination, caching, and optional features
 */
export function useDashboardPage<TData = any, TFilters = Record<string, any>>(
  options: DashboardPageOptions<TFilters> = {}
): DashboardPageReturn<TData, TFilters> {
  const {
    limit = 10,
    initialFilters = {} as TFilters,
    enableViewMode = false,
    enableDelete = false,
    deleteMutation,
    statsHook,
  } = options;

  const { currentPage } = usePage();
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Page store for cache management
  const { shouldRefetch, invalidateCache } = usePageStore();

  // Filters state
  const [filters, setFilters] = useState<TFilters>(initialFilters);

  // Computed: has active filters
  const hasActiveFilters = Object.values(filters as Record<string, any>).some(
    (value) => value !== undefined && value !== null &&
      (Array.isArray(value) ? value.length > 0 : true)
  );

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  // Search with debouncing
  const { search, setSearchValue, debouncedSearch } = useTableHeader({
    initialSearch: "",
    initialFilters: filters as Record<string, any>,
  });

  // Data fetching with cache support
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    refetch,
    fetchNextPage,
  } = useTableData<TData>({
    page: currentPage!,
    search: debouncedSearch,
    filters: filters as any,
    limit,
    forceRefetch: shouldRefetch,
  });

  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  // View mode
  const saved = localStorage.getItem(`${currentPage?.apiEndpoint}ViewMode`);
  const [viewMode, setViewMode] = useState<"table" | "cards">(saved === "cards" ? "cards" : "table");
  const handleViewModeChange = (newMode: "table" | "cards") => {
    setViewMode(newMode);
    if (enableViewMode) {
      localStorage.setItem(`${currentPage?.apiEndpoint}ViewMode`, newMode);
    }
  };

  // Delete functionality
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = () => {
    if (enableDelete && deleteMutation && deleteId) {
      const { mutate, isPending } = deleteMutation();
      setIsDeleting(true);
      mutate(deleteId, {
        onSuccess: () => {
          setDeleteId(null);
          setIsDeleting(false);
          refetch();
        },
        onError: () => {
          setIsDeleting(false);
        },
      });
    }
  };

  // Optional: Stats
  let stats;
  if (statsHook) {
    const { data: statsData } = statsHook();
    stats = statsData;
  }

  return {
    // UI State
    isFilterDialogOpen,
    setIsFilterDialogOpen,

    // Data
    data,
    stats,

    // Search
    search,
    setSearchValue,

    // Filters
    filters,
    setFilters,
    hasActiveFilters,
    handleClearFilters,

    // View Mode
    viewMode,
    handleViewModeChange,

    // Delete
    deleteId,
    setDeleteId,
    isDeleting,
    handleDelete,

    // Loading States
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    refetch,
    fetchNextPage,
    loadMoreRef,

    // Cache Management
    invalidateCache,
  };
}
