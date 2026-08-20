import { Line, LineChart, ResponsiveContainer } from "recharts";
import DashboardCard from "./DashboardCard";
import { CHART_COLORS, formatIQD } from "../utils";

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

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.3fr_1fr]">
      <DashboardCard
        className="min-h-[164px]"
        contentClassName="flex flex-col justify-between"
      >
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <span
              className={`text-xs font-bold ${
                revenueChange >= 0 ? "text-[#00dfa8]" : "text-[#ff5252]"
              }`}
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
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{formatIQD(lastMonthRevenue)}</span>
            <span>ايرادات الشهر الماضي</span>
          </div>
          <div className="h-6 overflow-hidden rounded-lg bg-muted">
            <div
              className="ms-auto h-full rounded-lg bg-[#00dfa8]"
              style={{ width: `${progressPct}%` }}
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
                stroke={salesUp ? CHART_COLORS.green : CHART_COLORS.red}
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
              className={`me-1 text-xs font-bold ${
                salesUp ? "text-[#00dfa8]" : "text-[#ff5252]"
              }`}
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
