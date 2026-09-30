import { Banknote, CreditCard, HandCoins, Wallet } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import DashboardCard from "./DashboardCard";
import { CHART_COLORS } from "../utils";
import { formatCount } from "@/utils/format-currency";

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

const haystack = (method: PaymentMethod) =>
  `${method.key ?? ""} ${method.name}`;

const isCashish = (method: PaymentMethod) =>
  /cash|كاش|نقد|cod|استلام|مباشر/i.test(haystack(method));

const isOnDelivery = (method: PaymentMethod) =>
  /cod|استلام|delivery/i.test(haystack(method));

const isCard = (method: PaymentMethod) =>
  /card|كارد|بطاقة|visa|فيزا|master|ماستر/i.test(haystack(method));

/** Figma gives each row a distinct mark, not one generic dot repeated. */
const MethodIcon = ({ method }: { method: PaymentMethod }) => {
  const className = "size-3.5";
  if (isOnDelivery(method)) return <HandCoins className={className} />;
  if (isCard(method)) return <CreditCard className={className} />;
  if (isCashish(method)) return <Banknote className={className} />;
  return <Wallet className={className} />;
};

/**
 * The «( كاش )» / «( دفع الكتروني )» qualifier is only worth adding when the
 * label does not already carry it — otherwise the row reads
 * «دفع مباشر ( كاش ) ( كاش )», which is what it used to do.
 */
const qualifierFor = (method: PaymentMethod): string | null => {
  const cash = isCashish(method);
  const qualifier = cash ? "( كاش )" : "( دفع الكتروني )";
  const name = method.name ?? "";
  if (name.includes("كاش") || name.includes("الكتروني")) return null;
  return qualifier;
};

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
      centerHeader
      className="min-h-[280px]"
      contentClassName="flex flex-col items-center pt-1"
    >
      {methods.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">لا توجد طرق دفع</p>
      ) : (
        <>
          <div className="relative h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={54}
                  outerRadius={78}
                  /* Figma's arc is one continuous sweep with rounded ends —
                     not segments separated by dark gaps. */
                  paddingAngle={0}
                  cornerRadius={12}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Dotted inner ring, as drawn. */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-1/2 size-[92px] -translate-x-1/2 rounded-full border border-dashed border-current opacity-15"
              style={{ clipPath: "inset(0 0 50% 0)" }}
            />

            <div className="absolute inset-x-0 bottom-1 text-center">
              <p className="text-xl font-bold text-foreground">
                {electronicPercent}%
              </p>
              <p
                className="text-[11px]"
                style={{ color: CHART_COLORS.brandPurple }}
              >
                دفع الكتروني
              </p>
            </div>
          </div>

          <div className="mt-4 w-full space-y-3">
            {methods.map((method) => {
              const qualifier = qualifierFor(method);
              return (
                <div
                  key={method.name}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="shrink-0 text-sm font-semibold text-foreground">
                    {formatCount(method.count ?? method.value)}
                  </span>
                  <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                    <p className="min-w-0 truncate text-end text-xs text-text-secondary">
                      {method.name}
                      {qualifier ? (
                        <span
                          className="ms-1 text-[10px]"
                          style={{ color: CHART_COLORS.brandPurple }}
                        >
                          {qualifier}
                        </span>
                      ) : null}
                    </p>
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${method.color}1f`,
                        color: method.color,
                      }}
                    >
                      <MethodIcon method={method} />
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
