import { useMemo } from "react";
import { useDashboardPage } from "@/hooks/use-dashboard-page";

const CURSOR_LIMIT = 10;

export function useDiscountsPage() {
  const actions = useDashboardPage<any, any>({
    limit: CURSOR_LIMIT,
    initialFilters: {},
    enableViewMode: false,
    enableDelete: false,
  });

  // Mock stats for discounts page since it's coming soon
  const mockStats = useMemo(() => ({
    totalDiscounts: 0,
    activeDiscounts: 0,
    averageDiscount: "0%",
    expiredDiscounts: 0,
  }), []);

  return {
    ...actions,
    stats: mockStats,
    discounts: actions?.data || [],
  };
}
