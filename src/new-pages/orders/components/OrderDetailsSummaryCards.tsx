/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";
import { Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import Ltr from "@/components/Ltr";
import CourierLogo from "@/components/CourierLogo";
import { formatCurrency, formatNumber } from "@/utils/format-currency";
import { getOrderProductCount, getOrderStatusMeta, getOrderTotal } from "../utils";
import {
  formatCourierStatusLabel,
  type CourierShipment,
} from "@/api/types/shipping";

/**
 * حالة الطرد لدى شركة الشحن — the platform's own normalised statuses.
 *
 * Kept beside the order's status rather than merged into it: a delivered
 * parcel deliberately does **not** advance the order, because closing an
 * order is the merchant's decision. So the two genuinely differ and the
 * delivery card has to show the parcel's, which is what it claims to be
 * about.
 */

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
  // Pieces, not lines: `_count.products` counts order lines, so 3 × shirt
  // read «1 قطعة» once the detail call had loaded the lines.
  const lines: any[] = Array.isArray(order?.products) ? order.products : [];
  const count = lines.length
    ? lines.reduce((sum, line) => sum + (Number(line?.quantity) || 1), 0)
    : getOrderProductCount(order);
  const goods = Number(
    order?.pricing?.subtotalAfterProductDiscounts ??
      order?.pricing?.subtotal ??
      (calculateTotal ? calculateTotal(order?.products ?? []) : 0),
  ) || 0;
  const delivery = Number(order?.deliveryFee ?? 0) || 0;
  const coupon = Number(order?.pricing?.couponDiscountTotal ?? 0) || 0;
  const pricedTotal = order?.pricing?.totalPrice;
  const apiTotal = Number(getOrderTotal(order, calculateTotal)) || 0;
  // `pricing.totalPrice` is goods after discounts and coupons, *without*
  // delivery, so the shopper's bill is that plus the fee. Reading it as the
  // whole bill dropped the delivery fee from every order with a coupon.
  //
  // When the API's total is just the goods line but delivery is listed
  // separately, the card used to show «1,000» next to a «3,000» shipping
  // row — look like a broken sum. Prefer goods+delivery in that case.
  const total =
    pricedTotal != null && !Number.isNaN(Number(pricedTotal))
      ? Number(pricedTotal) + delivery
      : delivery > 0 && Math.abs(apiTotal - goods) < 0.01
        ? goods + delivery
        : apiTotal || goods + delivery;

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

      <Row label="إجمالي المنتجات">{formatNumber(count)} قطعة</Row>
      <Row label="سعر المنتجات">
        <Ltr>{formatCurrency(goods)}</Ltr>
      </Row>
      {coupon > 0 ? (
        <Row label="خصم الكوبون">
          <Ltr>-{formatCurrency(coupon)}</Ltr>
        </Row>
      ) : null}
      <Row label="سعر التوصيل">
        <Ltr>{formatCurrency(delivery)}</Ltr>
      </Row>
      <Row label="إجمالي السعر" emphasis divider={false}>
        <Ltr>{formatCurrency(total)}</Ltr>
      </Row>
    </section>
  );
};

type DeliveryProps = {
  order: any;
  /**
   * Typed, deliberately, in a file that is otherwise `any`.
   *
   * It was `any`, and that is why this card read `shipment.trackingNumber` —
   * a field that has never existed on the payload, in the schema or in the
   * type — so «رقم الشحنة» rendered «—» for every dispatched parcel the
   * platform has ever had. The courier's own id is `externalId`.
   */
  shipment?: CourierShipment | null;
  courierName?: string | null;
  courierLogo?: string | null;
};

/** تفاصيل التوصيل — the parcel's identifiers with the courier. */
export const OrderDeliveryCard = ({
  order,
  shipment,
  courierName,
  courierLogo,
}: DeliveryProps) => {
  const orderStatus = getOrderStatusMeta(order?.status);
  const trackingNumber = shipment?.externalId ?? null;
  const reference = shipment?.reference ?? null;

  /**
   * The parcel's own status where there is a parcel, and the courier's own
   * words in preference to ours — they are what a merchant repeats on the
   * phone, and what says something useful when a parcel sits on a vague
   * status. With no parcel, the order's status is all there is to show.
   */
  const status = shipment
    ? formatCourierStatusLabel(shipment)
    : orderStatus.label;

  return (
    <section className="rounded-[24px] bg-white p-4 sm:p-5 dark:bg-[#0a0e27]">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-[#e4e7fc]">
          تفاصيل التوصيل
        </h3>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-[#e4e7fc]">
          {courierName?.trim() ? (
            <CourierLogo
              logo={courierLogo}
              className="size-7 rounded-lg p-1"
              iconClassName="size-4"
            />
          ) : null}
          {courierName?.trim() || "—"}
        </span>
      </header>

      <Row label="رقم الشحنة">
        {trackingNumber ? <Ltr>{String(trackingNumber)}</Ltr> : "—"}
      </Row>
      <Row label="كود الشحنة">
        {reference ? <Ltr>{String(reference)}</Ltr> : "—"}
      </Row>
      <Row label={shipment ? "حالة الطرد" : "الحالة"} divider={false}>
        <span className="text-sky-600 dark:text-[#33c5ff]">{status}</span>
      </Row>
    </section>
  );
};
