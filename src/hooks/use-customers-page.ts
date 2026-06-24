import { useDashboardPage } from "@/hooks/use-dashboard-page";

const CURSOR_LIMIT = 10;

export function useCustomersPage() {
  const actions = useDashboardPage<any, Record<string, never>>({
    limit: CURSOR_LIMIT,
    initialFilters: {},
    enableViewMode: false,
    enableDelete: false,
  });

  return {
    ...actions,
    customers: actions?.data || [],
  };
}
