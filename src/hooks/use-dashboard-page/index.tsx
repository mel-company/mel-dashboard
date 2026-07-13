import { useState, useCallback } from "react";
import { usePage } from "@/hooks/pages";
import { useTableData, useInfiniteScroll } from "@/hooks/use-table-data";
import useTableHeader from "@/hooks/table-header";
import { usePageStore } from "@/store/use-page-store";

// Helper hook for view mode management
function useViewModeManager(apiEndpoint: string | undefined, enableViewMode: boolean) {
  const storageKey = `${apiEndpoint}ViewMode`;
  const saved = enableViewMode ? localStorage.getItem(storageKey) : null;
  const [viewMode, setViewMode] = useState<"table" | "cards">(saved === "cards" ? "cards" : "table");

  const handleViewModeChange = useCallback((newMode: "table" | "cards") => {
    setViewMode(newMode);
    if (enableViewMode && apiEndpoint) {
      localStorage.setItem(storageKey, newMode);
    }
  }, [enableViewMode, apiEndpoint, storageKey]);

  return { viewMode, handleViewModeChange };
}

// Helper hook for delete functionality
function useDeleteManager(deleteMutation: any, enableDelete: boolean, refetch: () => void) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(() => {
    if (enableDelete && deleteMutation && deleteId) {
      const { mutate } = deleteMutation();
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
  }, [enableDelete, deleteMutation, deleteId, refetch]);

  return { deleteId, setDeleteId, isDeleting, handleDelete };
}

// Helper hook for optional stats
function useOptionalStats(statsHook: any) {
  if (!statsHook) return undefined;
  const { data: statsData } = statsHook();
  return statsData;
}

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
  imageBaseUrl: string;
  stats?: any;

  // Search
  search: string;
  setSearchValue: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;

  // Filters
  filters: TFilters;
  setFilters: (filters: TFilters) => void;
  hasActiveFilters: boolean;
  handleClearFilters: () => void;

  // View Mode (only included when enabled)
  viewMode: "table" | "cards";
  handleViewModeChange: (mode: "table" | "cards") => void;

  // Delete (only included when enabled)
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

  // Core data fetching
  const tableData = useTableData<TData>({
    page: currentPage!,
    search: debouncedSearch,
    filters: filters as any,
    limit,
    forceRefetch: shouldRefetch,
  });

  const infiniteScroll = useInfiniteScroll({
    hasNextPage: tableData.hasNextPage,
    isFetchingNextPage: tableData.isFetchingNextPage,
    fetchNextPage: tableData.fetchNextPage,
  });

  // View mode management
  const viewModeManager = useViewModeManager(currentPage?.apiEndpoint, enableViewMode);

  // Delete functionality
  const deleteManager = useDeleteManager(deleteMutation, enableDelete, tableData.refetch);

  // Stats
  const stats = useOptionalStats(statsHook);

  return {
    // UI State
    isFilterDialogOpen,
    setIsFilterDialogOpen,

    // Data
    data: tableData.data,
    imageBaseUrl: tableData.imageBaseUrl,
    stats,

    // Search
    search,
    setSearchValue,
    searchQuery: search,
    onSearchChange: setSearchValue,

    // Filters
    filters,
    setFilters,
    hasActiveFilters,
    handleClearFilters,

    // View Mode functionality (always included when enabled)
    ...(enableViewMode ? {
      viewMode: viewModeManager.viewMode,
      handleViewModeChange: viewModeManager.handleViewModeChange,
    } : {
      viewMode: "table" as const,
      handleViewModeChange: () => { },
    }),

    // Delete functionality (always included when enabled)
    ...(enableDelete ? {
      deleteId: deleteManager.deleteId,
      setDeleteId: deleteManager.setDeleteId,
      isDeleting: deleteManager.isDeleting,
      handleDelete: deleteManager.handleDelete,
    } : {
      deleteId: null,
      setDeleteId: () => { },
      isDeleting: false,
      handleDelete: () => { },
    }),

    // Loading States
    isLoading: tableData.isLoading,
    isFetchingNextPage: tableData.isFetchingNextPage,
    hasNextPage: tableData.hasNextPage,
    error: tableData.error,
    refetch: tableData.refetch,
    fetchNextPage: tableData.fetchNextPage,
    loadMoreRef: infiniteScroll,

    // Cache Management
    invalidateCache,
  };
}
