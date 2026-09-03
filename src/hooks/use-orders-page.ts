import { useMemo } from "react";
import { useDashboardPage } from "@/hooks/use-dashboard-page";
import type { OrderFilterValues } from "@/pages/order/OrderFilterDialog";
import {
  useFetchOrdersStatusStats,
  useFetchStoreStats,
} from "@/api/wrappers/stats.wrappers";
import { formatNumber } from "@/utils/format-currency";

const CURSOR_LIMIT = 20;

function buildFilterTags(
  filters: OrderFilterValues,
  setFilters: (filters: OrderFilterValues) => void,
) {
  const tags = [];

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

function getActiveFilterCount(filters: OrderFilterValues): number {
  return (
    (filters.status !== undefined ? 1 : 0) +
    (filters.period !== undefined ? 1 : 0)
  );
}

function statusCount(
  rows: Array<{ status?: string; count?: number }> | undefined,
  matchers: string[],
) {
  if (!Array.isArray(rows)) return 0;
  return rows.reduce((sum, row) => {
    const key = String(row.status ?? "").toUpperCase();
    if (matchers.some((m) => key.includes(m))) {
      return sum + Number(row.count ?? 0);
    }
    return sum;
  }, 0);
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
    statsHook: useFetchStoreStats,
  });

  const { data: statusStats } = useFetchOrdersStatusStats();

  const filterTags = useMemo(() => {
    return buildFilterTags(actions.filters, actions.setFilters);
  }, [actions.filters, actions.setFilters]);

  const activeFilterCount = useMemo(() => {
    return getActiveFilterCount(actions.filters);
  }, [actions.filters]);

  const calculateTotal = (orderProducts: any[] = []) => {
    return orderProducts.reduce((sum, op) => {
      const price = op.variant?.price || op.product?.price || op.price || 0;
      const quantity = op.quantity || 1;
      return sum + price * quantity;
    }, 0);
  };

  const orders = actions?.data || [];

  const derivedAmount = useMemo(() => {
    return orders.reduce((sum: number, order: any) => {
      const priced =
        order?.pricing?.totalPrice ??
        order?.pricing?.subtotalAfterProductDiscounts ??
        order?.totalPrice ??
        order?.total;
      if (priced != null && !Number.isNaN(Number(priced))) {
        return sum + Number(priced);
      }
      return sum + calculateTotal(order?.products ?? []);
    }, 0);
  }, [orders]);

  const statusRows = Array.isArray(statusStats)
    ? statusStats
    : statusStats?.ordersStatusStats ?? statusStats?.data ?? [];

  const pendingOrders =
    statusCount(statusRows, ["PENDING", "PROCESSING", "SHIPPED"]) ||
    Number(actions.stats?.pendingOrders ?? 0);
  const completedOrders =
    statusCount(statusRows, ["DELIVERED"]) ||
    Number(actions.stats?.completedOrders ?? 0);
  const totalOrders = Number(
    actions.stats?.orders ?? actions.stats?.totalOrders ?? orders.length,
  );
  const totalAmount = Number(
    actions.stats?.totalOrdersAmount ??
      actions.stats?.ordersAmount ??
      actions.stats?.revenue ??
      derivedAmount,
  );

  return {
    ...actions,
    filterTags,
    activeFilterCount,
    orders,
    calculateTotal,
    stats: {
      pendingOrders,
      completedOrders,
      totalOrders,
      totalAmount,
      totalAmountLabel: formatNumber(totalAmount),
      ordersGrowth: actions.stats?.trends?.orders ?? actions.stats?.ordersGrowth,
      amountGrowth:
        actions.stats?.trends?.revenue ?? actions.stats?.amountGrowth,
    },
  };
}
