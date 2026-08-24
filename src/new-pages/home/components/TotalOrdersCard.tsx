import { Area, AreaChart, Dot, ResponsiveContainer } from "recharts";
import DashboardCard from "./DashboardCard";
import { formatIQD, getTrendColor } from "../utils";

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
  const positive = changePercent >= 0;
  const stroke = getTrendColor(true);

  return (
    <DashboardCard
      className="min-h-[200px] flex-1"
      contentClassName="flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-end gap-0.5">
          <span
            className="text-[11px] font-bold"
            style={{ color: getTrendColor(positive) }}
          >
            {Math.abs(changePercent)}
            <span className="ms-0.5">{positive ? "↗" : "↘"}</span>
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
                <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={stroke}
              strokeWidth={2}
              fill="url(#ordersArea)"
              dot={(props) => {
                const { cx, cy, index } = props;
                if (index !== sparkline.length - 1 || cx == null || cy == null) {
                  return <g key={`dot-${index}`} />;
                }
                return (
                  <Dot
                    key={`dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill="#fff"
                    stroke={stroke}
                    strokeWidth={2}
                  />
                );
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
};

export default TotalOrdersCard;
