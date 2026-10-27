/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  formatOrderCode,
  getOrderPaymentLabel,
  getOrderStatusLabel,
  parseLocalizedName,
} from "@/new-pages/orders/utils";
import { formatDateParts } from "@/utils/format-date";

export type InvoiceLine = {
  key: string;
  name: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  total: number;
  /** Price × quantity when a discount brought the line below it. */
  before: number | null;
};

export type InvoiceStore = {
  name?: string | null;
  logo?: string | null;
  phone?: string | null;
};

export type OrderInvoice = {
  code: string;
  date: string;
  status: string;
  customerName: string;
  customerPhone: string;
  address: string;
  nearestPoint: string;
  note: string;
  payment: string;
  lines: InvoiceLine[];
  /** Lines at full price, before any discount. */
  subtotal: number;
  productDiscount: number;
  couponDiscount: number;
  delivery: number;
  total: number;
};

const num = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const lineName = (item: any): string =>
  item?.product?.name ??
  item?.product?.title ??
  item?.variant?.product?.name ??
  item?.variant?.product?.title ??
  item?.name ??
  "منتج";

/**
 * The invoice, worked out once from the order the panel already holds, so
 * the page and the PDF cannot disagree.
 *
 * The old template priced every order with a hardcoded 5,000 delivery fee,
 * ignored product and coupon discounts, and read place names from a key the
 * API does not send, so a discounted order printed a higher total than the
 * customer owed and an empty address.
 */
export function buildOrderInvoice(order: any): OrderInvoice {
  const items: any[] = Array.isArray(order?.products) ? order.products : [];

  const lines: InvoiceLine[] = items.map((item, index) => {
    const quantity = num(item?.quantity);
    const unitPrice = num(item?.price ?? item?.unitPrice);
    const full = unitPrice * quantity;
    const after =
      item?.lineTotalAfterDiscount == null
        ? full
        : num(item.lineTotalAfterDiscount);
    return {
      key: String(item?.id ?? index),
      name: String(lineName(item)),
      variant: (item?.variant?.optionValues ?? [])
        .map((v: any) => String(v?.label ?? v?.value ?? "").trim())
        .filter(Boolean)
        .join(" · "),
      quantity,
      unitPrice,
      total: after,
      before: after < full - 0.005 ? full : null,
    };
  });

  const linesFull = lines.reduce((sum, l) => sum + (l.before ?? l.total), 0);
  const linesAfter = lines.reduce((sum, l) => sum + l.total, 0);
  const pricing = order?.pricing ?? {};
  const subtotal =
    pricing.subtotalBeforeDiscounts != null
      ? num(pricing.subtotalBeforeDiscounts)
      : linesFull;
  const afterProducts =
    pricing.subtotalAfterProductDiscounts != null
      ? num(pricing.subtotalAfterProductDiscounts)
      : linesAfter;
  const couponDiscount = num(pricing.couponDiscountTotal);
  const delivery = num(order?.deliveryFee);
  // `totalPrice` is the goods after every discount; delivery is on top.
  const goods =
    pricing.totalPrice != null
      ? num(pricing.totalPrice)
      : afterProducts - couponDiscount;

  const { date } = formatDateParts(order?.createdAt);
  const payment = getOrderPaymentLabel(order).label;
  const customer = order?.customer?.user ?? order?.customer ?? {};

  return {
    code: formatOrderCode(order?.id),
    date: date || "—",
    status: getOrderStatusLabel(order?.status),
    customerName: String(customer?.name ?? "").trim() || "—",
    customerPhone: String(customer?.phone ?? "").trim(),
    address: [
      parseLocalizedName(order?.state?.name),
      parseLocalizedName(order?.region?.name),
    ]
      .filter(Boolean)
      .join(" - "),
    nearestPoint: String(order?.nearest_point ?? "").trim(),
    note: String(order?.note ?? "").trim(),
    payment: payment === "—" ? "" : payment,
    lines,
    subtotal,
    productDiscount: Math.max(0, subtotal - afterProducts),
    couponDiscount,
    delivery,
    total: goods + delivery,
  };
}
