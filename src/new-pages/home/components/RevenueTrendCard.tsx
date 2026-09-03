import { Line, LineChart, ResponsiveContainer } from "recharts";
import DashboardCard from "./DashboardCard";
import { formatIQD, getTrendColor } from "../utils";

type TrendPoint = { value: number };

type RevenueTrendCardProps = {
  revenue: number;
  lastMonthRevenue: number;
  progress: number;
  salesTrend: TrendPoint[];
  revenueChange: number;
  salesChange: number;
  salesStatus: string;
};

const formatChange = (value: number) => {
  const abs = Math.abs(value);
  return value >= 0 ? `${abs}↗` : `${abs}↘`;
};

const RevenueTrendCard = ({
  revenue,
  lastMonthRevenue,
  progress,
  salesTrend,
  revenueChange,
  salesChange,
  salesStatus,
}: RevenueTrendCardProps) => {
  const progressPct = Math.round(Math.min(Math.max(progress, 0), 1) * 100);
  const salesUp = salesChange >= 0;
  const revenueUp = revenueChange >= 0;
  const success = getTrendColor(true);
  const salesStroke = getTrendColor(salesUp);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.3fr_1fr]">
      <DashboardCard
        className="min-h-[164px]"
        contentClassName="flex flex-col justify-between"
      >
        <div className="text-right">
          <div className="flex items-center justify-end gap-0.5">
            <span
              className="text-[11px] font-bold"
              style={{ color: getTrendColor(revenueUp) }}
            >
              {formatChange(revenueChange)}
            </span>
            <p className="text-sm font-medium text-text-secondary dark:text-foreground">
              ايرادات المتجر
            </p>
          </div>
          <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
            {formatIQD(revenue)}
          </p>
        </div>
        <div className="mt-3 space-y-1">
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">
              ايرادات الشهر الماضي
            </p>
            <p className="text-xs text-muted-foreground">
              {formatIQD(lastMonthRevenue)}
            </p>
          </div>
          <div className="h-6 overflow-hidden rounded-lg bg-muted">
            <div
              className="ms-auto h-full rounded-lg"
              style={{ width: `${progressPct}%`, backgroundColor: success }}
            />
          </div>
        </div>
      </DashboardCard>

      <DashboardCard
        className="min-h-[164px]"
        contentClassName="flex flex-col justify-between"
      >
        <p className="text-right text-base font-bold text-foreground">
          قراءة عمليات البيع
        </p>
        <div className="h-14 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesTrend}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={salesStroke}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground">الحالة العامة</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">
            <span
              className="me-1 text-xs font-bold"
              style={{ color: salesStroke }}
            >
              {formatChange(salesChange)}
            </span>
            {salesStatus}
          </p>
        </div>
      </DashboardCard>
    </div>
  );
};

export default RevenueTrendCard;
