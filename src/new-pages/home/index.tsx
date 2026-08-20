import { useMemo } from "react";
import { useFetchDashboardHome } from "@/api/wrappers/dashboard.wrappers";
import SalesOverviewChart from "./components/SalesOverviewChart";
import TotalOrdersCard from "./components/TotalOrdersCard";
import PeakAccessDayCard from "./components/PeakAccessDayCard";
import TopProductsCard from "./components/TopProductsCard";
import TopCustomersCard from "./components/TopCustomersCard";
import PaymentMethodsCard from "./components/PaymentMethodsCard";
import OrderStatusChart from "./components/OrderStatusChart";
import RevenueTrendCard from "./components/RevenueTrendCard";
import SupportReportsChart from "./components/SupportReportsChart";
import TopCategoriesCard from "./components/TopCategoriesCard";
import SubscriptionCard from "./components/SubscriptionCard";
import TopDiscountsCard from "./components/TopDiscountsCard";
import DashboardSkeleton from "./components/DashboardSkeleton";
import {
  AR_WEEKDAYS_SUNDAY_FIRST,
  PAYMENT_METHOD_COLORS,
  toArabicMonth,
} from "./utils";

const isCashPayment = (key: string, label: string) =>
  /cash|كاش|نقد|cod|استلام/i.test(`${key} ${label}`);

const makeSparkline = (values: number[]) =>
  values.map((value) => ({ value }));

const HomeDashboard = () => {
  const { data, isLoading, isError, error, refetch } = useFetchDashboardHome();

  const salesChartData = useMemo(() => {
    const months = data?.revenueCard.months ?? [];
    const lineA = data?.revenueCard.lineA ?? [];
    const lineB = data?.revenueCard.lineB ?? [];

    return months.map((month, i) => {
      const total = lineA[i] ?? 0;
      const delivered = lineB[i] ?? 0;
      return {
        month: toArabicMonth(month),
        delivered,
        pending: Math.max(total - delivered, 0),
      };
    });
  }, [data?.revenueCard]);

  const weeklyAccess = useMemo(() => {
    const bars = data?.bestArrivalDay.bars ?? [0, 0, 0, 0, 0, 0, 0];
    return AR_WEEKDAYS_SUNDAY_FIRST.map((day, i) => ({
      day: day.slice(0, 3),
      value: bars[i] ?? 0,
    }));
  }, [data?.bestArrivalDay.bars]);

  const topProducts = useMemo(
    () =>
      (data?.topProducts ?? []).map((product) => ({
        id: product.id,
        name: product.name,
        count: product.orders,
        image: product.imageUrl ?? undefined,
      })),
    [data?.topProducts],
  );

  const maxProductCount = Math.max(...topProducts.map((p) => p.count), 1);

  const orderStatusItems = useMemo(
    () =>
      (data?.orderStatusPie ?? []).map((item) => ({
        status: item.label,
        count: item.value,
        color: item.color,
      })),
    [data?.orderStatusPie],
  );

  const paymentMethods = useMemo(() => {
    const types = data?.paymentTypes ?? [];
    const total = types.reduce((sum, item) => sum + item.count, 0);

    return types.map((item, index) => ({
      name: item.label,
      value:
        total > 0
          ? Math.round((item.count / total) * 100)
          : types.length === 1
            ? 100
            : 0,
      color: PAYMENT_METHOD_COLORS[index % PAYMENT_METHOD_COLORS.length]!,
      key: item.key,
    }));
  }, [data?.paymentTypes]);

  const electronicPercent = useMemo(() => {
    const types = data?.paymentTypes ?? [];
    const total = types.reduce((sum, item) => sum + item.count, 0);
    if (total === 0) {
      const nonCash = types.filter((t) => !isCashPayment(t.key, t.label));
      if (types.length === 0) return 0;
      return Math.round((nonCash.length / types.length) * 100);
    }
    const electronic = types
      .filter((t) => !isCashPayment(t.key, t.label))
      .reduce((sum, item) => sum + item.count, 0);
    return Math.round((electronic / total) * 100);
  }, [data?.paymentTypes]);

  const supportData = useMemo(() => {
    const reports = data?.supportReports;
    if (!reports) return [];
    return reports.labels.map((day, i) => ({
      day,
      requests: reports.requests[i] ?? 0,
      resolved: reports.solved[i] ?? 0,
    }));
  }, [data?.supportReports]);

  const topCustomers = useMemo(
    () =>
      (data?.topCustomers ?? []).map((customer) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        orders: customer.orders,
        avatar: customer.avatarUrl,
      })),
    [data?.topCustomers],
  );

  const topCategories = useMemo(
    () =>
      (data?.topCategories ?? []).map((category) => ({
        id: category.id,
        name: category.name,
        percent: category.percent,
      })),
    [data?.topCategories],
  );

  const topCoupons = useMemo(
    () =>
      (data?.topCoupons ?? []).map((coupon) => ({
        id: coupon.id,
        name: coupon.title || coupon.code,
        type: coupon.code,
        usageCount: coupon.uses,
        progress: coupon.progress,
      })),
    [data?.topCoupons],
  );

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div
        className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-[28px] bg-surface p-6 text-center"
        dir="rtl"
      >
        <p className="text-sm text-muted-foreground">
          {(error as Error)?.message || "تعذر تحميل لوحة التحكم"}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const { revenueCard, ordersCard, storeRevenue, salesReading, subscription } =
    data;

  const revenueSparkline = makeSparkline(ordersCard.area);
  const salesSparkline = makeSparkline(salesReading.wave);

  return (
    <div
      className="min-h-full space-y-3 rounded-[28px] bg-surface p-3 sm:space-y-3 sm:p-4 lg:gap-3 lg:space-y-3 lg:p-4"
      dir="rtl"
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-3">
        <SalesOverviewChart
          data={salesChartData}
          deliveredTotal={revenueCard.deliveredAmount}
          pendingTotal={revenueCard.pendingAmount}
          growthPercent={revenueCard.growthPercent}
        />

        <div className="flex flex-col gap-3 lg:col-span-2">
          <PeakAccessDayCard
            peakDay={data.bestArrivalDay.day}
            weeklyData={weeklyAccess}
          />
          <TotalOrdersCard
            total={ordersCard.totalOrders}
            changePercent={revenueCard.growthPercent}
            sparkline={revenueSparkline}
            asOrderCount
          />
        </div>

        <TopProductsCard products={topProducts} maxCount={maxProductCount} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-3">
        <div className="flex flex-col gap-3 lg:col-span-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_1fr]">
            <TopCustomersCard customers={topCustomers} />
            <PaymentMethodsCard
              methods={paymentMethods}
              electronicPercent={electronicPercent}
            />
          </div>
          <SupportReportsChart data={supportData} />
        </div>

        <div className="flex flex-col gap-3 lg:col-span-3">
          <OrderStatusChart items={orderStatusItems} />
          <TopCategoriesCard categories={topCategories} />
        </div>

        <div className="flex flex-col gap-3 lg:col-span-4">
          <RevenueTrendCard
            revenue={storeRevenue.amount}
            lastMonthRevenue={storeRevenue.lastMonth}
            progress={storeRevenue.progress}
            salesTrend={salesSparkline}
            revenueChange={revenueCard.growthPercent}
            salesChange={salesReading.trendPercent}
            salesStatus={salesReading.status}
          />
          <SubscriptionCard
            planCode={subscription.planCode}
            planTitle={subscription.planTitle}
            expiresAt={subscription.expiresAt}
            daysLeft={subscription.daysLeft}
          />
          <TopDiscountsCard discounts={topCoupons} />
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
