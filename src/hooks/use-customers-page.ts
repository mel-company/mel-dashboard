import { useMemo } from "react";
import { useDashboardPage } from "@/hooks/use-dashboard-page";
import { useDeleteCustomer } from "@/api/wrappers/customer.wrappers";
import { useFetchStoreStats } from "@/api/wrappers/stats.wrappers";

const CURSOR_LIMIT = 10;

export function useCustomersPage() {
  const actions = useDashboardPage<any, Record<string, never>>({
    limit: CURSOR_LIMIT,
    initialFilters: {},
    enableViewMode: false,
    enableDelete: true,
    deleteMutation: useDeleteCustomer,
    statsHook: useFetchStoreStats,
  });

  const customers = actions.data || [];

  const noOrderCustomers = useMemo(
    () =>
      customers.filter((c: any) => (c._count?.orders ?? 0) === 0).length,
    [customers],
  );

  return {
    ...actions,
    customers,
    stats: {
      totalCustomers: actions.stats?.customers ?? customers.length,
      newCustomers: actions.stats?.newCustomers ?? 0,
      noOrderCustomers,
    },
  };
}
