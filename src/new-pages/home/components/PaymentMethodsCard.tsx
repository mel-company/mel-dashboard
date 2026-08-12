import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import DashboardCard from "./DashboardCard";
import { CHART_COLORS } from "../utils";

type PaymentMethod = {
  name: string;
  value: number;
  color: string;
};

type PaymentMethodsCardProps = {
  methods: PaymentMethod[];
  electronicPercent: number;
};

const PaymentMethodsCard = ({
  methods,
  electronicPercent,
}: PaymentMethodsCardProps) => {
  return (
    <DashboardCard
      title="طرق الدفع"
      className="min-h-[280px]"
      contentClassName="flex flex-col items-center"
    >
      <div className="relative h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={methods}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {methods.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-x-0 bottom-2 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {electronicPercent}%
          </p>
          <p className="text-xs text-slate-500 dark:text-white/45">دفع إلكتروني</p>
        </div>
      </div>
      <div className="mt-2 w-full space-y-2">
        {methods.map((method) => (
          <div
            key={method.name}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: method.color }}
              />
              <span className="text-slate-600 dark:text-white/60">{method.name}</span>
            </div>
            <span className="font-semibold text-slate-800 dark:text-white/80">
              {method.value}%
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export const defaultPaymentMethods = [
  { name: "كي-كارد (إلكتروني)", value: 80, color: CHART_COLORS.cyan },
  { name: "الدفع عند الاستلام", value: 12, color: CHART_COLORS.orange },
  { name: "نقدي مباشر", value: 8, color: CHART_COLORS.purple },
];

export default PaymentMethodsCard;
