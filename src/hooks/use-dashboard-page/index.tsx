import { useState, useCallback } from "react";
import { toast } from "sonner";
import { usePage } from "@/hooks/pages";
import { useTableData, useInfiniteScroll } from "@/hooks/use-table-data";
import useTableHeader from "@/hooks/table-header";
import { usePageStore } from "@/store/use-page-store";

// Helper hook for view mode management
function getInitialViewMode(saved: string | null): "table" | "cards" {
  if (saved === "cards" || saved === "table") return saved;
  if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
    return "cards";
  }
  return "table";
}

function useViewModeManager(apiEndpoint: string | undefined, enableViewMode: boolean) {
  const storageKey = `${apiEndpoint}ViewMode`;
  const saved = enableViewMode ? localStorage.getItem(storageKey) : null;
  const [viewMode, setViewMode] = useState<"table" | "cards">(() =>
    getInitialViewMode(saved),
  );

  const handleViewModeChange = useCallback((newMode: "table" | "cards") => {
    setViewMode(newMode);
    if (enableViewMode && apiEndpoint) {
      localStorage.setItem(storageKey, newMode);
    }
  }, [enableViewMode, apiEndpoint, storageKey]);

  return { viewMode, handleViewModeChange };
}

/**
 * Stands in when a page enables no delete, so the mutation below is always
 * called and the hook count stays the same on every render.
 */
const NO_DELETE_MUTATION = {
  // Unreachable in practice: `handleDelete` is stubbed out on the way out of
  // `useDashboardPage` whenever `enableDelete` is false.
  mutate: () => {},
  isPending: false,
};
const useNoDeleteMutation = () => NO_DELETE_MUTATION;

/** The API's own wording when it has some, rather than a generic failure. */
function apiMessage(error: unknown): string | undefined {
  const message = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  return typeof message === "string" && message.trim() ? message : undefined;
}

/**
 * Delete state for the row the merchant is confirming.
 *
 * `deleteMutation` is a hook — `useDeleteProduct`, `useDeleteCustomer` — so it
 * has to run here, in a hook body. It used to be called inside `handleDelete`,
 * i.e. from the click handler, where React has no dispatcher and the
 * `useQueryClient` inside it throws `Cannot read properties of null (reading
 * 'useContext')`. That throw landed before `mutate` existed, so confirming a
 * delete did nothing whatsoever: no DELETE, no spinner, no toast, dialog still
 * open, row still there. Nothing caught it, so the only trace was a line in the
 * console — leaving the hide button beside it as the only one of the two that
 * did anything at all.
 *
 * Lint could not see it either: `react-hooks/rules-of-hooks` keys off the name
 * of the callee, and the callee here is a parameter called `deleteMutation`.
 *
 * `isPending` comes from the mutation rather than a `useState` beside it, so
 * the button cannot be left spinning by a path that forgot to clear a flag.
 */
function useDeleteManager(deleteMutation: any, enableDelete: boolean, refetch: () => void) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { mutate, isPending } = (
    enableDelete && deleteMutation ? deleteMutation : useNoDeleteMutation
  )();

  const handleDelete = useCallback(() => {
    if (!deleteId) return;
    mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
        refetch();
      },
      // Silence here is what made a rejected delete — a 403, or a row another
      // tab already removed — indistinguishable from a dead button.
      onError: (error: unknown) => {
        toast.error(apiMessage(error) ?? "فشل الحذف، حاول مرة أخرى");
      },
    });
  }, [mutate, deleteId, refetch]);

  return { deleteId, setDeleteId, isDeleting: isPending, handleDelete };
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
