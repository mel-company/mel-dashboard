import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import DashboardCard from "./DashboardCard";

type OrderStatusItem = {
  status: string;
  count: number;
  color: string;
};

type OrderStatusChartProps = {
  items: OrderStatusItem[];
};

const OrderStatusChart = ({ items }: OrderStatusChartProps) => {
  const total = items.reduce((sum, item) => sum + item.count, 0);

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
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{total}</p>
          <p className="text-xs text-slate-500 dark:text-white/45">طلب</p>
        </div>
      </div>
      <div className="w-full flex-1 space-y-3">
        {items.map((item) => (
          <div key={item.status} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-slate-600 dark:text-white/70">
                {item.status}
              </span>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default OrderStatusChart;
