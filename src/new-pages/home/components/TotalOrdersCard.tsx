import { Area, AreaChart, ResponsiveContainer } from "recharts";
import DashboardCard from "./DashboardCard";
import { CHART_COLORS, formatIQD } from "../utils";

type TotalOrdersCardProps = {
  total: number;
  changePercent: number;
  sparkline: { value: number }[];
  asOrderCount?: boolean;
};

const TotalOrdersCard = ({
  total,
  changePercent,
  sparkline,
  asOrderCount = false,
}: TotalOrdersCardProps) => {
  return (
    <DashboardCard
      className="min-h-[200px] flex-1"
      contentClassName="flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs font-bold text-[#00dfa8]">
            {changePercent}
            <span className="ms-0.5">↗</span>
          </span>
          <p className="text-sm font-medium text-text-secondary dark:text-foreground">
            {asOrderCount ? "أجمالي طلبات" : "إجمالي مبالغ الطلبات"}
          </p>
        </div>
        <p className="mt-1 text-right text-2xl font-bold leading-tight text-foreground">
          {asOrderCount
            ? `${Math.round(total).toLocaleString("ar-IQ")} طلب`
            : formatIQD(total)}
        </p>
      </div>
      <div className="mt-3 h-[88px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkline}>
            <defs>
              <linearGradient id="ordersArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.green} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_COLORS.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={CHART_COLORS.green}
              strokeWidth={2}
              fill="url(#ordersArea)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
};

export default TotalOrdersCard;
