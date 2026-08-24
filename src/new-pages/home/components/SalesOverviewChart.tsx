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
import {
  CHART_COLORS,
  formatIQD,
  getChartTheme,
  getTrendColor,
} from "../utils";

type SalesPoint = {
  month: string;
  delivered: number;
  pending: number;
};

type SalesOverviewChartProps = {
  data: SalesPoint[];
  deliveredTotal: number;
  pendingTotal: number;
  totalAmount?: number;
  growthPercent?: number;
};

const formatGrowth = (value: number) => {
  const abs = Math.abs(value);
  const arrow = value >= 0 ? "↗" : "↘";
  return `${abs}${arrow}`;
};

const formatYTick = (value: number) => {
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)} مليون`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} الف`;
  return String(value);
};

const SalesOverviewChart = ({
  data,
  deliveredTotal,
  pendingTotal,
  totalAmount,
  growthPercent = 0,
}: SalesOverviewChartProps) => {
  const theme = getChartTheme();
  const growthPositive = growthPercent >= 0;
  const total = totalAmount ?? deliveredTotal + pendingTotal;

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
        <div className="flex flex-wrap items-center gap-1">
          <div className="rounded-xl bg-muted px-3 py-2 text-right">
            <p className="text-[10px] text-[#91a0b6]">مبالغ الطلبات المعلقة</p>
            <p className="text-xs font-normal text-foreground">
              {formatIQD(pendingTotal)}
            </p>
          </div>
          <div className="rounded-xl bg-muted px-3 py-2 text-right">
            <p className="text-[10px] text-[#91a0b6]">مبالغ الطلبات المسلمة</p>
            <p className="text-xs font-normal text-foreground">
              {formatIQD(deliveredTotal)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-0.5">
            <span
              className="text-[11px] font-bold"
              style={{ color: getTrendColor(growthPositive) }}
            >
              {formatGrowth(growthPercent)}
            </span>
            <p className="text-sm font-medium text-text-secondary dark:text-foreground">
              أجمالي مبالغ الطلبات
            </p>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatIQD(total)}</p>
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
                <stop
                  offset="0%"
                  stopColor={CHART_COLORS.purpleSoft}
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor={CHART_COLORS.purpleSoft}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={theme.grid} vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.tick, fontSize: 10 }}
            />
            <YAxis
              width={44}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYTick}
              tick={{ fill: theme.tick, fontSize: 8 }}
            />
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
