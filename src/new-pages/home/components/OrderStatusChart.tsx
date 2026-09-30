import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import DashboardCard from "./DashboardCard";
import { formatCount } from "@/utils/format-currency";
import { cn } from "@/lib/utils";

type OrderStatusItem = {
  status: string;
  count: number;
  color: string;
  /** Period-over-period change, as Figma shows beside each row. */
  trendPercent?: number | null;
};

type OrderStatusChartProps = {
  items: OrderStatusItem[];
};

const OrderStatusChart = ({ items }: OrderStatusChartProps) => {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  if (items.length === 0) {
    return (
      <DashboardCard
        title="حالة الطلبات"
        className="min-h-[215px]"
        contentClassName="flex items-center justify-center"
      >
        <p className="text-sm text-muted-foreground">لا توجد طلبات في الفترة</p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="حالة الطلبات"
      className="min-h-[215px]"
      contentClassName="flex flex-col items-center gap-4 sm:flex-row"
    >
      <div className="relative size-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={68}
              paddingAngle={2}
              dataKey="count"
              stroke="none"
            >
              {items.map((entry) => (
                <Cell key={entry.status} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCount(total)}
          </p>
          <p className="text-xs text-slate-500 dark:text-white/45">طلب</p>
        </div>
      </div>
      <div className="w-full flex-1 space-y-3">
        {items.map((item) => {
          const trend = item.trendPercent;
          const down = typeof trend === "number" && trend < 0;
          return (
            <div key={item.status} className="space-y-0.5">
              {/* Figma: label with its dot on one line, then the count with
                  its unit and the period trend underneath. */}
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-slate-600 dark:text-white/70">
                  {item.status}
                </span>
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                {typeof trend === "number" && trend !== 0 ? (
                  <span
                    className={cn(
                      "text-[11px] font-bold tabular-nums",
                      down ? "text-destructive" : "text-success",
                    )}
                  >
                    {Math.abs(trend)}
                    <span aria-hidden className="ms-0.5">{down ? "↘" : "↗"}</span>
                  </span>
                ) : null}
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatCount(item.count)}
                  <span className="ms-1 text-xs font-normal text-slate-500 dark:text-white/45">
                    طلب
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
};

export default OrderStatusChart;
