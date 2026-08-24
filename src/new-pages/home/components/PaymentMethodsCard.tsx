import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import DashboardCard from "./DashboardCard";
import { CHART_COLORS } from "../utils";
import { cn } from "@/lib/utils";

type PaymentMethod = {
  name: string;
  value: number;
  count?: number;
  color: string;
  key?: string;
};

type PaymentMethodsCardProps = {
  methods: PaymentMethod[];
  electronicPercent: number;
};

const isCashish = (method: PaymentMethod) =>
  /cash|كاش|نقد|cod|استلام|مباشر/i.test(`${method.key ?? ""} ${method.name}`);

const PaymentMethodsCard = ({
  methods,
  electronicPercent,
}: PaymentMethodsCardProps) => {
  const chartData =
    methods.length > 0 && methods.every((m) => m.value === 0)
      ? methods.map((m) => ({ ...m, value: 1 }))
      : methods;

  return (
    <DashboardCard
      title="نوع الدفع"
      subtitle="احصائيات نوع عمليات الدفع"
      className="min-h-[280px]"
      contentClassName="flex flex-col items-center pt-2"
    >
      {methods.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">لا توجد طرق دفع</p>
      ) : (
        <>
          <div className="relative h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
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
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-x-0 bottom-2 text-center">
              <p className="text-xl font-bold text-foreground sm:text-2xl">
                {electronicPercent}%
              </p>
              <p
                className="text-xs"
                style={{ color: CHART_COLORS.brandPurple }}
              >
                دفع الكتروني
              </p>
            </div>
          </div>
          <div className="mt-3 w-full space-y-3">
            {methods.map((method) => {
              const cash = isCashish(method);
              return (
                <div
                  key={method.name}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {(method.count ?? method.value).toLocaleString("ar-IQ")}
                  </span>
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-center text-xs text-text-secondary">
                      {method.name}
                      <span
                        className="ms-1 text-[10px]"
                        style={{ color: CHART_COLORS.brandPurple }}
                      >
                        {cash ? "( كاش )" : "( دفع الكتروني )"}
                      </span>
                    </p>
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted",
                      )}
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: method.color }}
                      />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </DashboardCard>
  );
};

export const defaultPaymentMethods = [
  { name: "كي-كارد", value: 80, count: 813, color: CHART_COLORS.cyan },
  { name: "عند الاستلام", value: 12, count: 813, color: CHART_COLORS.orange },
  { name: "دفع مباشر", value: 8, count: 1145, color: CHART_COLORS.purple },
];

export default PaymentMethodsCard;
