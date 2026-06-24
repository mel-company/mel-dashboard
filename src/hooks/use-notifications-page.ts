import { useMemo } from "react";
import { useDashboardPage } from "@/hooks/use-dashboard-page";

const CURSOR_LIMIT = 10;

export function useNotificationsPage() {
  const actions = useDashboardPage<any, any>({
    limit: CURSOR_LIMIT,
    initialFilters: {},
    enableViewMode: false,
    enableDelete: false,
  });

  // Mock stats for notifications page since it's coming soon
  const mockStats = useMemo(() => ({
    totalNotifications: 0,
    newNotifications: 0,
    readNotifications: 0,
    unreadNotifications: 0,
  }), []);

  return {
    ...actions,
    stats: mockStats,
    notifications: actions?.data || [],
  };
}
