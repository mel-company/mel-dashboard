import { useMemo } from "react";
import { useDashboardPage } from "@/hooks/use-dashboard-page";

const CURSOR_LIMIT = 10;

export function useTicketsPage() {
  const actions = useDashboardPage<any, any>({
    limit: CURSOR_LIMIT,
    initialFilters: {},
    enableViewMode: false,
    enableDelete: false,
  });

  // Mock stats for tickets page since it's coming soon
  const mockStats = useMemo(() => ({
    totalTickets: 0,
    newTickets: 0,
    openTickets: 0,
    urgentTickets: 0,
  }), []);

  return {
    ...actions,
    stats: mockStats,
    tickets: actions?.data || [],
  };
}
