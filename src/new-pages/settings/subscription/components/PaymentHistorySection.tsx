import { useStorePaymentHistory } from "@/api/wrappers/platform-payment.wrapper";
import { paymentProviderLabel } from "@/new-pages/settings/components/PaymentProviderPicker";
import { billingPeriodLabel } from "@/utils/subscription-quote";
import { formatCurrency } from "@/utils/format-currency";
import { cn } from "@/lib/utils";
import {
  bodyClass,
  cellClass,
  formatDay,
  headRowClass,
  tableClass,
  thClass,
} from "./table";

const TYPE_LABELS: Record<string, string> = {
  INITIAL_SUBSCRIPTION: "اشتراك جديد",
  RENEWAL: "تجديد",
  CHANGE_PLAN: "تغيير الباقة",
  DOMAIN_REGISTRATION: "شراء نطاق",
  CREDITS: "شراء رصيد",
};

const STATUS_LABELS: Record<string, string> = {
  PAID: "مدفوع",
  FAILED: "فشل",
  EXPIRED: "انتهت مهلته",
  REFUNDED: "مسترد",
  PARTIALLY_REFUNDED: "مسترد جزئياً",
};

/** The store's past subscription payments. */
const PaymentHistorySection = () => {
  const { data, isError, isLoading } = useStorePaymentHistory();
  if (isLoading) return null;
  if (isError) {
    return (
      <div>
        <p className="text-sm text-slate-500">تعذر تحميل سجل المدفوعات.</p>
      </div>
    );
  }
  const rows = data ?? [];

  return (
    <div>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">لا توجد مدفوعات بعد.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className={cn(tableClass, "sm:min-w-[640px]")}>
            <thead>
              <tr className={headRowClass}>
                <th className={thClass}>التاريخ</th>
                <th className={thClass}>العملية</th>
                <th className={cn(thClass, "hidden sm:table-cell")}>الباقة</th>
                <th className={cn(thClass, "hidden sm:table-cell")}>المدة</th>
                <th className={thClass}>المبلغ</th>
                <th className={cn(thClass, "hidden sm:table-cell")}>
                  الدفع عبر
                </th>
                <th className={thClass}>الحالة</th>
              </tr>
            </thead>
            <tbody className={bodyClass}>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className={cellClass}>
                    {formatDay(row.paidAt ?? row.createdAt)}
                  </td>
                  <td className={cellClass}>
                    {TYPE_LABELS[row.type] ?? row.type}
                  </td>
                  <td className={cn(cellClass, "hidden sm:table-cell")}>
                    {row.plan?.name ?? "—"}
                  </td>
                  <td className={cn(cellClass, "hidden sm:table-cell")}>
                    {row.type === "DOMAIN_REGISTRATION"
                      ? "—"
                      : (billingPeriodLabel(row.billingPeriod) ?? "—")}
                  </td>
                  <td className={cn(cellClass, "whitespace-nowrap")}>
                    {row.amount > 0 ? formatCurrency(row.amount) : "مجاناً"}
                  </td>
                  <td className={cn(cellClass, "hidden sm:table-cell")}>
                    {row.amount > 0 ? paymentProviderLabel(row.provider) : "—"}
                  </td>
                  <td
                    className={cn(
                      cellClass,
                      row.status === "PAID"
                        ? "text-emerald-600"
                        : "text-slate-500",
                    )}
                  >
                    {STATUS_LABELS[row.status] ?? row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentHistorySection;
