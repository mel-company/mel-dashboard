import { useMemo, useState, useCallback } from "react";
import useTableHeader from "@/hooks/table-header";
import { useFilterTicketsStoreCursor } from "@/api/wrappers/ticket.wrappers";
import { useInfiniteScroll } from "@/hooks/use-table-data";
import type { SupportTicketListItem } from "@/api/types/ticket";
import type { TicketFilterValues } from "@/pages/support/TicketFilterDialog";

const CURSOR_LIMIT = 10;

function flattenTicketPages(pages: unknown[] | undefined): SupportTicketListItem[] {
  if (!pages) return [];

  return pages.flatMap((page) => {
    if (Array.isArray(page)) return page as SupportTicketListItem[];
    if (
      page &&
      typeof page === "object" &&
      Array.isArray((page as { data?: unknown[] }).data)
    ) {
      return (page as { data: SupportTicketListItem[] }).data;
    }
    return [];
  });
}

function isOpenStatus(status?: string): boolean {
  const s = status?.toUpperCase();
  return s === "OPEN" || s === "IN_PROGRESS" || s === "ON_HOLD";
}

export function useTicketsPage() {
  const { search, setSearchValue, debouncedSearch } = useTableHeader({
    initialSearch: "",
  });

  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<TicketFilterValues>({
    type: undefined,
    status: undefined,
    department: undefined,
  });

  const hasActiveFilters = Boolean(
    filters.type || filters.status || filters.department,
  );

  const activeFilterCount = [
    filters.type,
    filters.status,
    filters.department,
  ].filter(Boolean).length;

  const ticketQuery = useFilterTicketsStoreCursor({
    query: debouncedSearch.trim() || undefined,
    type: filters.type,
    status: filters.status,
    department: filters.department,
    limit: CURSOR_LIMIT,
  });

  const tickets = useMemo(
    () => flattenTicketPages(ticketQuery.data?.pages),
    [ticketQuery.data?.pages],
  );

  const stats = useMemo(
    () => ({
      totalTickets: tickets.length,
      newTickets: tickets.filter((t) => {
        if (!t.createdAt) return false;
        const created = new Date(t.createdAt).getTime();
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return created >= dayAgo;
      }).length,
      openTickets: tickets.filter((t) => isOpenStatus(t.status)).length,
      urgentTickets: tickets.filter(
        (t) => t.priority?.toUpperCase() === "URGENT",
      ).length,
    }),
    [tickets],
  );

  const handleClearFilters = useCallback(() => {
    setFilters({
      type: undefined,
      status: undefined,
      department: undefined,
    });
  }, []);

  const loadMoreRef = useInfiniteScroll({
    hasNextPage: !!ticketQuery.hasNextPage,
    isFetchingNextPage: ticketQuery.isFetchingNextPage,
    fetchNextPage: ticketQuery.fetchNextPage,
  });

  return {
    tickets,
    data: tickets,
    stats,
    search,
    searchQuery: search,
    setSearchValue,
    onSearchChange: setSearchValue,
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    filters,
    setFilters,
    hasActiveFilters,
    activeFilterCount,
    handleClearFilters,
    isLoading: ticketQuery.isLoading,
    isFetchingNextPage: ticketQuery.isFetchingNextPage,
    hasNextPage: !!ticketQuery.hasNextPage,
    error: ticketQuery.error as Error | null,
    refetch: ticketQuery.refetch,
    fetchNextPage: ticketQuery.fetchNextPage,
    loadMoreRef,
  };
}
