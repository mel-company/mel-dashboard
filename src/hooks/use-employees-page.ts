import { useMemo } from "react";
import { useDashboardPage } from "@/hooks/use-dashboard-page";

const CURSOR_LIMIT = 10;

export function useEmployeesPage() {
  const actions = useDashboardPage<any, any>({
    limit: CURSOR_LIMIT,
    initialFilters: {},
    enableViewMode: false,
    enableDelete: false,
  });

  // Mock stats for employees page since it's coming soon
  const mockStats = useMemo(() => ({
    totalEmployees: 0,
    newEmployees: 0,
    activeEmployees: 0,
    totalDepartments: 0,
  }), []);

  return {
    ...actions,
    stats: mockStats,
    employees: actions?.data || [],
  };
}
