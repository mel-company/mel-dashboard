import { useMemo } from "react";
import { useDashboardPage } from "@/hooks/use-dashboard-page";
import {
  useDeleteEmployee,
  useFetchEmployeeStats,
} from "@/api/wrappers/employee.wrappers";

const CURSOR_LIMIT = 10;

export function useEmployeesPage() {
  const actions = useDashboardPage<any, Record<string, never>>({
    limit: CURSOR_LIMIT,
    initialFilters: {},
    enableViewMode: false,
    enableDelete: true,
    deleteMutation: useDeleteEmployee,
    statsHook: useFetchEmployeeStats,
  });

  const employees = actions.data || [];

  const stats = useMemo(() => {
    const api = actions.stats;
    return {
      totalEmployees: api?.totalEmployees ?? employees.length,
      dataManagers: api?.dataManagers ?? 0,
      ordersManagers: api?.ordersManagers ?? 0,
      seatsUsed: api?.seatsUsed ?? 0,
      seatsMax: api?.seatsMax ?? 1,
    };
  }, [actions.stats, employees.length]);

  return {
    ...actions,
    employees,
    stats,
  };
}
