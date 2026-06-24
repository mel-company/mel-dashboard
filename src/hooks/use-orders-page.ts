import { useMemo } from "react";
import { useDashboardPage } from "@/hooks/use-dashboard-page";
import type { OrderFilterValues } from "@/pages/order/OrderFilterDialog";

const CURSOR_LIMIT = 20;

// Helper function to build filter tags
function buildFilterTags(filters: OrderFilterValues, setFilters: (filters: OrderFilterValues) => void) {
  const tags = [];

  // Status filter tag
  if (filters.status !== undefined) {
    const statusLabels: Record<string, string> = {
      pending: "قيد الانتظار",
      processing: "قيد المعالجة",
      shipped: "تم الشحن",
      delivered: "تم التسليم",
      cancelled: "ملغي",
    };
    
    tags.push({
      id: "status",
      label: statusLabels[filters.status] || filters.status,
      onRemove: () => setFilters({ ...filters, status: undefined }),
    });
  }

  // Period filter tag
  if (filters.period !== undefined) {
    const periodLabels: Record<string, string> = {
      today: "اليوم",
      week: "هذا الأسبوع",
      month: "هذا الشهر",
      year: "هذه السنة",
    };
    
    tags.push({
      id: "period",
      label: periodLabels[filters.period] || filters.period,
      onRemove: () => setFilters({ ...filters, period: undefined }),
    });
  }

  return tags;
}

// Helper function to calculate active filter count
function getActiveFilterCount(filters: OrderFilterValues): number {
  return (filters.status !== undefined ? 1 : 0) + (filters.period !== undefined ? 1 : 0);
}

export function useOrdersPage() {
  const actions = useDashboardPage<any, OrderFilterValues>({
    limit: CURSOR_LIMIT,
    initialFilters: {
      status: undefined,
      period: undefined,
    },
    enableViewMode: false,
    enableDelete: false,
  });

  // Build filter tags
  const filterTags = useMemo(() => {
    return buildFilterTags(actions.filters, actions.setFilters);
  }, [actions.filters, actions.setFilters]);

  // Memoize active filter count
  const activeFilterCount = useMemo(() => {
    return getActiveFilterCount(actions.filters);
  }, [actions.filters]);

  // Calculate total price for order (supports variant.price and quantity)
  const calculateTotal = (orderProducts: any[] = []) => {
    return orderProducts.reduce((sum, op) => {
      const price = op.variant?.price || op.product?.price || 0;
      const quantity = op.quantity || 1;
      return sum + (price * quantity);
    }, 0);
  };

  return {
    ...actions,
    filterTags,
    activeFilterCount,
    orders: actions?.data || [],
    calculateTotal,
  };
}
