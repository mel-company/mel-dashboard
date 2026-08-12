import { useMemo } from "react";
import {
  useFetchCombinedStats,
  useFetchStoreStats,
} from "@/api/wrappers/stats.wrappers";
import SalesOverviewChart from "./components/SalesOverviewChart";
import TotalOrdersCard from "./components/TotalOrdersCard";
import PeakAccessDayCard, {
  defaultWeeklyAccess,
} from "./components/PeakAccessDayCard";
import TopProductsCard from "./components/TopProductsCard";
import TopCustomersCard from "./components/TopCustomersCard";
import PaymentMethodsCard, {
  defaultPaymentMethods,
} from "./components/PaymentMethodsCard";
import OrderStatusChart from "./components/OrderStatusChart";
import RevenueTrendCard from "./components/RevenueTrendCard";
import SupportReportsChart from "./components/SupportReportsChart";
import TopCategoriesCard from "./components/TopCategoriesCard";
import SubscriptionCard from "./components/SubscriptionCard";
import TopDiscountsCard from "./components/TopDiscountsCard";
import DashboardSkeleton from "./components/DashboardSkeleton";
import { AR_MONTHS, CHART_COLORS } from "./utils";

const STATUS_COLORS: Record<string, string> = {
  delivered: CHART_COLORS.green,
  مسلّم: CHART_COLORS.green,
  pending: CHART_COLORS.orange,
  معلّق: CHART_COLORS.orange,
  cancelled: CHART_COLORS.red,
  ملغي: CHART_COLORS.red,
};

const fallbackSalesData = AR_MONTHS.slice(0, 7).map((month, i) => ({
  month,
  delivered: [820, 940, 880, 1100, 980, 1250, 1180][i]! * 1_000_000,
  pending: [120, 160, 140, 200, 180, 220, 190][i]! * 1_000_000,
}));

const fallbackTopProducts = [
  { id: "1", name: "Sony WH-1000XM5", count: 248 },
  { id: "2", name: "AirPods Pro 2", count: 196 },
  { id: "3", name: "Samsung Galaxy S24", count: 172 },
  { id: "4", name: "MacBook Air M3", count: 134 },
  { id: "5", name: "iPad Pro 12.9", count: 98 },
];

const fallbackCustomers = [
  { id: "1", name: "محمد علي يوسف", phone: "+964 770 123 4567", points: 61 },
  { id: "2", name: "سارة أحمد", phone: "+964 780 234 5678", points: 54 },
  { id: "3", name: "علي حسين", phone: "+964 790 345 6789", points: 48 },
  { id: "4", name: "نور عبدالله", phone: "+964 750 456 7890", points: 42 },
  { id: "5", name: "حسام كريم", phone: "+964 771 567 8901", points: 37 },
];

const fallbackSupportData = Array.from({ length: 12 }, (_, i) => ({
  day: `${i + 1}`,
  requests: [8, 12, 10, 15, 11, 18, 14, 16, 13, 19, 15, 17][i] ?? 12,
  resolved: [6, 10, 9, 13, 10, 15, 12, 14, 11, 16, 13, 15][i] ?? 10,
}));

const fallbackCategories = [
  { id: "1", name: "إلكترونيات", percent: 25 },
  { id: "2", name: "أزياء", percent: 25 },
  { id: "3", name: "منزل ومطبخ", percent: 25 },
  { id: "4", name: "رياضة", percent: 25 },
];

const fallbackDiscounts = [
  { id: "1", name: "SUMMER30", type: "30% نسبة مئوية", usageCount: 152, maxUsage: 200 },
  { id: "2", name: "WELCOME10", type: "10,000 د.ع ثابت", usageCount: 152, maxUsage: 200 },
  { id: "3", name: "VIP50", type: "50% نسبة مئوية", usageCount: 152, maxUsage: 200 },
];

const makeSparkline = (values: number[]) => values.map((value) => ({ value }));

const HomeDashboard = () => {
  const { data: combinedStats, isLoading: loadingCombined } =
    useFetchCombinedStats({ period: "1y" });
  const { data: storeStats, isLoading: loadingStore } = useFetchStoreStats();

  const monthlySales = combinedStats?.monthlySales ?? [];
  const ordersStatusStats = combinedStats?.ordersStatusStats ?? [];
  const mostBoughtProducts = combinedStats?.mostBoughtProducts ?? [];

  const salesChartData = useMemo(() => {
    if (monthlySales.length > 0) {
      return monthlySales.map(
        (item: { month: string; sales: number; orders: number }) => ({
          month: item.month,
          delivered: item.sales * 1_000_000,
          pending: item.orders * 500_000,
        }),
      );
    }
    return fallbackSalesData;
  }, [monthlySales]);

  const deliveredTotal = salesChartData.reduce(
    (sum: number, d: { delivered: number }) => sum + d.delivered,
    0,
  );
  const pendingTotal = salesChartData.reduce(
    (sum: number, d: { pending: number }) => sum + d.pending,
    0,
  );

  const topProducts = useMemo(() => {
    if (mostBoughtProducts.length > 0) {
      return mostBoughtProducts.map(
        (p: { name: string; count: number }, i: number) => ({
          id: String(i),
          name: p.name,
          count: p.count,
        }),
      );
    }
    return fallbackTopProducts;
  }, [mostBoughtProducts]);

  const maxProductCount = Math.max(...topProducts.map((p) => p.count), 1);

  const orderStatusItems = useMemo(() => {
    if (ordersStatusStats.length > 0) {
      return ordersStatusStats.map(
        (item: { status: string; count: number }) => ({
          status: item.status,
          count: item.count,
          color:
            STATUS_COLORS[item.status.toLowerCase()] ?? CHART_COLORS.muted,
        }),
      );
    }
    return [
      { status: "مسلّم", count: 842, color: CHART_COLORS.green },
      { status: "معلّق", count: 156, color: CHART_COLORS.orange },
      { status: "ملغي", count: 43, color: CHART_COLORS.red },
    ];
  }, [ordersStatusStats]);

  const totalRevenue = deliveredTotal + pendingTotal;
  const revenueSparkline = makeSparkline(
    salesChartData.map((d: { delivered: number }) => d.delivered / 1_000_000),
  );
  const salesSparkline = makeSparkline(
    salesChartData.map((d: { pending: number }) => d.pending / 500_000),
  );
  const orderCountFromStatus = orderStatusItems.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const totalOrdersCount =
    storeStats?.totalOrders ??
    (orderCountFromStatus > 0 ? orderCountFromStatus : 12_512);

  const isLoading = loadingCombined || loadingStore;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div
      className="min-h-full space-y-3 rounded-[28px] bg-surface p-3 sm:space-y-3 sm:p-4 lg:gap-3 lg:space-y-3 lg:p-4"
      dir="rtl"
    >
      {/* الصف 1 — Figma: Chart 793 | Peak+Orders 282 | Products 288 → 7 | 2 | 3 */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-3">
        <SalesOverviewChart
          data={salesChartData}
          deliveredTotal={deliveredTotal}
          pendingTotal={pendingTotal}
        />

        <div className="flex flex-col gap-3 lg:col-span-2">
          <PeakAccessDayCard
            peakDay="الجمعة"
            weeklyData={defaultWeeklyAccess}
          />
          <TotalOrdersCard
            total={totalOrdersCount}
            changePercent={12.8}
            sparkline={revenueSparkline}
            asOrderCount
          />
        </div>

        <TopProductsCard products={topProducts} maxCount={maxProductCount} />
      </div>

      {/* الصف 2 — Figma: ColA 534 | ColB 355 | ColC 474 → 5 | 3 | 4 */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-3">
        {/* العمود الأيمن: عملاء + دفع فوق، دعم تحت */}
        <div className="flex flex-col gap-3 lg:col-span-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_1fr]">
            <TopCustomersCard customers={fallbackCustomers} />
            <PaymentMethodsCard
              methods={defaultPaymentMethods}
              electronicPercent={80}
            />
          </div>
          <SupportReportsChart data={fallbackSupportData} />
        </div>

        {/* العمود الوسط: حالة الطلبات + الفئات */}
        <div className="flex flex-col gap-3 lg:col-span-3">
          <OrderStatusChart items={orderStatusItems} />
          <TopCategoriesCard categories={fallbackCategories} />
        </div>

        {/* العمود الأيسر: إيرادات + قراءة بيع، اشتراك، خصومات */}
        <div className="flex flex-col gap-3 lg:col-span-4">
          <RevenueTrendCard
            revenue={totalRevenue || 98_500_000_000}
            revenueTrend={revenueSparkline}
            salesTrend={salesSparkline}
            revenueChange={8.4}
            salesChange={-12.8}
          />
          <SubscriptionCard />
          <TopDiscountsCard discounts={fallbackDiscounts} />
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
