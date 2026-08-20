import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardCard from "./DashboardCard";
import { CHART_COLORS, formatIQD, getChartTheme } from "../utils";

type SalesPoint = {
  month: string;
  delivered: number;
  pending: number;
};

type SalesOverviewChartProps = {
  data: SalesPoint[];
  deliveredTotal: number;
  pendingTotal: number;
  growthPercent?: number;
};

const formatGrowth = (value: number) => {
  const abs = Math.abs(value);
  const arrow = value >= 0 ? "↗" : "↘";
  return `${abs}${arrow}`;
};

const SalesOverviewChart = ({
  data,
  deliveredTotal,
  pendingTotal,
  growthPercent = 0,
}: SalesOverviewChartProps) => {
  const theme = getChartTheme();
  const growthPositive = growthPercent >= 0;

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { value: number; dataKey: string; color: string }[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="rounded-xl border px-3 py-2 text-xs shadow-xl"
        style={{
          background: theme.tooltipBg,
          borderColor: theme.tooltipBorder,
          color: theme.tooltipText,
        }}
      >
        <p className="mb-1 font-medium opacity-70">{label}</p>
        {payload.map((item) => (
          <p key={item.dataKey} style={{ color: item.color }}>
            {item.dataKey === "delivered" ? "مبالغ مسلّمة" : "مبالغ معلّقة"}:{" "}
            {formatIQD(item.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <DashboardCard
      className="min-h-[320px] lg:col-span-7"
      contentClassName="flex flex-col pt-2"
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl bg-muted px-3 py-2 text-right">
            <p className="text-[10px] text-muted-foreground">مبالغ الطلبات المعلقة</p>
            <p className="text-xs font-medium text-foreground">
              {formatIQD(pendingTotal)}
            </p>
          </div>
          <div className="rounded-xl bg-muted px-3 py-2 text-right">
            <p className="text-[10px] text-muted-foreground">مبالغ الطلبات المسلمة</p>
            <p className="text-xs font-medium text-foreground">
              {formatIQD(deliveredTotal)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <span
              className={`text-xs font-bold ${
                growthPositive ? "text-[#00dfa8]" : "text-[#ff5252]"
              }`}
            >
              {formatGrowth(growthPercent)}
            </span>
            <p className="text-sm font-medium text-text-secondary dark:text-foreground">
              أجمالي مبالغ الطلبات
            </p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatIQD(deliveredTotal + pendingTotal)}
          </p>
        </div>
      </div>
      <div className="h-[220px] w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="deliveredGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.purpleSoft} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_COLORS.purpleSoft} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={theme.grid} vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.tick, fontSize: 11 }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="delivered"
              stroke={CHART_COLORS.cyan}
              strokeWidth={2.5}
              fill="url(#deliveredGrad)"
            />
            <Area
              type="monotone"
              dataKey="pending"
              stroke={CHART_COLORS.purpleSoft}
              strokeWidth={2.5}
              fill="url(#pendingGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
};

export default SalesOverviewChart;
