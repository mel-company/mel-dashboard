import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
  const requestFill = theme.isDark
    ? "rgba(178, 130, 255, 0.35)"
    : "rgba(125, 38, 247, 0.15)";
  const solvedFill = theme.isDark
    ? CHART_COLORS.green
    : CHART_COLORS.greenLight;

  return (
    <DashboardCard className="min-h-[259px]" contentClassName="pt-2">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className="size-2 rounded"
              style={{ backgroundColor: solvedFill }}
            />
            <span className="text-[11px] text-[#bac2cf] dark:text-muted-foreground">
              تم حل المشكلة
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="size-2 rounded"
              style={{ backgroundColor: requestFill }}
            />
            <span className="text-[11px] text-[#bac2cf] dark:text-muted-foreground">
              طلب الدعم
            </span>
          </div>
        </div>
        <h3 className="text-sm font-bold text-text-secondary dark:text-foreground sm:text-base">
          تقارير الدعم
        </h3>
      </div>
      <div className="h-[188px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} barCategoryGap="18%">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.tick, fontSize: 10 }}
            />
            <YAxis
              width={28}
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.tick, fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                background: theme.tooltipBg,
                border: `1px solid ${theme.tooltipBorder}`,
                borderRadius: 12,
                fontSize: 12,
                color: theme.tooltipText,
              }}
            />
            <Bar
              dataKey="resolved"
              name="تم حل المشكلة"
              fill={solvedFill}
              radius={[4, 4, 0, 0]}
              maxBarSize={14}
            />
            <Bar
              dataKey="requests"
              name="طلب الدعم"
              fill={requestFill}
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
