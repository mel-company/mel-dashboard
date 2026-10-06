/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";
import { Percent, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import Ltr from "@/components/Ltr";
import { formatCurrency, formatNumber } from "@/utils/format-currency";
import { getOrderProductCount, getOrderStatusMeta, getOrderTotal } from "../utils";

const Row = ({
  label,
  children,
  emphasis,
  divider = true,
}: {
  label: string;
  children: ReactNode;
  emphasis?: boolean;
  divider?: boolean;
}) => (
  <div
    className={cn(
      "flex items-center justify-between gap-3 py-2.5",
      divider && "border-b border-slate-100 dark:border-[#1f2448]",
    )}
  >
    <span
      className={cn(
        "text-left text-[13px] font-semibold text-slate-900 dark:text-[#e4e7fc]",
        emphasis && "text-lg font-bold text-sky-600 dark:text-[#33c5ff]",
      )}
    >
      {children}
    </span>
    <span className="text-[13px] text-slate-500 dark:text-[#a4b1fa]">
      {label}
    </span>
  </div>
);

type FinancialProps = {
  order: any;
  calculateTotal?: (products: any[]) => number;
  onAddDiscount?: () => void;
};

/** تفاصيل المالية — item count, goods, delivery, and what the customer pays. */
export const OrderFinancialCard = ({
  order,
  calculateTotal,
  onAddDiscount,
}: FinancialProps) => {
  const count = getOrderProductCount(order);
  const goods =
    order?.pricing?.subtotalAfterProductDiscounts ??
    order?.pricing?.subtotal ??
    (calculateTotal ? calculateTotal(order?.products ?? []) : 0);
  const delivery = Number(order?.deliveryFee ?? 0) || 0;
  const total = getOrderTotal(order, calculateTotal);

  return (
    <section className="rounded-[24px] bg-white p-4 sm:p-5 dark:bg-[#0a0e27]">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-[#e4e7fc]">
          تفاصيل المالية
        </h3>
        {onAddDiscount ? (
          <button
            type="button"
            onClick={onAddDiscount}
            className="flex items-center gap-2 rounded-[14px] bg-sky-50 py-1.5 pe-1.5 ps-3 text-xs font-medium text-sky-600 transition-colors hover:bg-sky-100 dark:bg-[#33c5ff]/10 dark:text-[#33c5ff] dark:hover:bg-[#33c5ff]/20"
          >
            أضافة خصم
            <span className="flex size-7 items-center justify-center rounded-[10px] bg-sky-500/15 dark:bg-[#33c5ff]/20">
              <Percent className="size-3.5" strokeWidth={2.5} />
            </span>
          </button>
        ) : null}
      </header>

      <Row label="أجمالي المنتجات">{formatNumber(count)} قطعة</Row>
      <Row label="سعر المنتجات">
        <Ltr>{formatCurrency(goods)}</Ltr>
      </Row>
      <Row label="سعر التوصيل">
        <Ltr>{formatCurrency(delivery)}</Ltr>
      </Row>
      <Row label="اجمالي السعر" emphasis divider={false}>
        <Ltr>{formatCurrency(total)}</Ltr>
      </Row>
    </section>
  );
};

type DeliveryProps = {
  order: any;
  shipment?: any;
  courierName?: string | null;
};

/** تفاصيل التوصيل — the parcel's identifiers with the courier. */
export const OrderDeliveryCard = ({
  order,
  shipment,
  courierName,
}: DeliveryProps) => {
  const status = getOrderStatusMeta(order?.status);
  const trackingNumber =
    shipment?.trackingNumber ?? shipment?.tracking_number ?? null;
  const reference =
    shipment?.reference ?? shipment?.shipmentCode ?? shipment?.code ?? null;

  return (
    <section className="rounded-[24px] bg-white p-4 sm:p-5 dark:bg-[#0a0e27]">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-[#e4e7fc]">
          تفاصيل التوصيل
        </h3>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-[#e4e7fc]">
          <Truck className="size-4 text-rose-500" />
          {courierName?.trim() || "—"}
        </span>
      </header>

      <Row label="رقم الشحنة">
        {trackingNumber ? <Ltr>{String(trackingNumber)}</Ltr> : "—"}
      </Row>
      <Row label="كود الشحنة">
        {reference ? <Ltr>{String(reference)}</Ltr> : "—"}
      </Row>
      <Row label="الحالة" divider={false}>
        <span className="text-sky-600 dark:text-[#33c5ff]">{status.label}</span>
      </Row>
    </section>
  );
};
