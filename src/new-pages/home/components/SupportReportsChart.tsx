import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DashboardCard from "./DashboardCard";
import { CHART_COLORS, getChartTheme } from "../utils";

type SupportPoint = {
  day: string;
  requests: number;
  resolved: number;
};

type SupportReportsChartProps = {
  data: SupportPoint[];
};

const SupportReportsChart = ({ data }: SupportReportsChartProps) => {
  const theme = getChartTheme();

  return (
    <DashboardCard
      title="تقارير الدعم"
      subtitle="طلبات الدعم والمشاكل المحلولة"
      className="min-h-[259px]"
      contentClassName="pt-2"
    >
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} barCategoryGap="18%">
            <CartesianGrid stroke={theme.grid} vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.tick, fontSize: 11 }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: theme.tooltipBg,
                border: `1px solid ${theme.tooltipBorder}`,
                borderRadius: 12,
                fontSize: 12,
                color: theme.tooltipText,
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: 12,
                color: theme.isDark ? "rgba(255,255,255,0.6)" : "#64748b",
              }}
            />
            <Bar
              dataKey="requests"
              name="طلبات الدعم"
              fill={CHART_COLORS.green}
              radius={[4, 4, 0, 0]}
              maxBarSize={14}
            />
            <Bar
              dataKey="resolved"
              name="المشاكل المحلولة"
              fill={CHART_COLORS.cyan}
              radius={[4, 4, 0, 0]}
              maxBarSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
};

export default SupportReportsChart;
