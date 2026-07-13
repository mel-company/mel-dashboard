import type { CreatePrimeShipmentInput } from "@/api/types/prime";
import type { OrderPrimeShipment } from "@/api/types/order-prime";
import { formatPhoneForPrime } from "@/utils/prime/phone";
import {
  getPrimeDistrictId,
  getPrimeDistrictLabel,
  pickDefaultPrimeDistrict,
  pickDefaultPrimeState,
} from "@/utils/prime/lookups";

export function getOrderPrimeShipment(
  order: Record<string, unknown> | null | undefined,
): OrderPrimeShipment | null {
  const raw = (order?.prime_shipment ?? order?.primeShipment) as
    | Record<string, unknown>
    | null
    | undefined;
  if (!raw) return null;

  return {
    caseId: (raw.case_id as number | undefined) ?? (raw.caseId as number | undefined),
    merchantShipmentCode:
      (raw.merchant_shipment_code as string | undefined) ??
      (raw.merchantShipmentCode as string | undefined),
    status: (raw.status as string | undefined) ?? undefined,
    shippingFee:
      (raw.shipping_fee as number | undefined) ??
      (raw.shippingFee as number | undefined),
    receiptNumber:
      (raw.receipt_number as string | undefined) ??
      (raw.receiptNumber as string | undefined),
  };
}

export function formatPrimeShipmentStatus(status?: string): string {
  const map: Record<string, string> = {
    CREATED: "تم الإنشاء",
    PICKED_UP: "تم الاستلام",
    IN_TRANSIT: "قيد التوصيل",
    DELIVERED: "تم التسليم",
    RETURNED: "مرتجع",
    CANCELLED: "ملغي",
  };
  return status ? (map[status] ?? status) : "—";
}

export function guessPrimeStateFromOrder(
  order: Record<string, unknown>,
): string | undefined {
  const customer = (order.customer as Record<string, unknown> | undefined)?.user as
    | Record<string, unknown>
    | undefined;
  const text = [
    order.address,
    order.nearest_point,
    customer?.location,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("بصرة") || text.includes("basra")) return "BAS";
  if (text.includes("بغداد") || text.includes("baghdad")) return "BGD";
  if (text.includes("نينوى") || text.includes("mosul") || text.includes("ninawa"))
    return "NIN";
  if (text.includes("أربيل") || text.includes("erbil") || text.includes("arbil"))
    return "ARB";
  return undefined;
}

function normalizeArabicText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

export function getOrderDeliveryAddress(order: Record<string, unknown>): string {
  const parts = [order.address, order.nearest_point].filter(Boolean);
  return parts.length > 0 ? parts.join("، ") : "—";
}

/** يطابق قضاء Prime من عنوان التوصيل (مو قضاء المحل) */
export function guessPrimeDistrictFromOrder(
  order: Record<string, unknown>,
  districts: Record<string, unknown>[],
): number | undefined {
  const address = normalizeArabicText(getOrderDeliveryAddress(order));
  if (!address || address === "—" || districts.length === 0) return undefined;

  const areaHints = [
    "بلد محزم",
    "محزم",
    "الجزائر",
    "جزائر",
    "العشار",
    "عشار",
    "ابي الخصيب",
    "الخصيب",
    "الزبير",
    "القرنه",
    "شط العرب",
    "المدينه",
    "المدينة",
  ];

  for (const hint of areaHints) {
    const normalizedHint = normalizeArabicText(hint);
    if (!address.includes(normalizedHint)) continue;

    for (const district of districts) {
      const label = normalizeArabicText(getPrimeDistrictLabel(district));
      if (
        label.includes(normalizedHint) ||
        normalizedHint.includes(label) ||
        label.split(/[\s،,-]+/).some((part) => part.length >= 3 && normalizedHint.includes(part))
      ) {
        const id = getPrimeDistrictId(district);
        if (id != null) return id;
      }
    }
  }

  for (const district of districts) {
    const label = normalizeArabicText(getPrimeDistrictLabel(district));
    if (!label || label === "—") continue;

    if (address.includes(label) || label.includes(address)) {
      const id = getPrimeDistrictId(district);
      if (id != null) return id;
    }

    const keywords = label.split(/[\s،,-]+/).filter((part) => part.length >= 3);
    if (keywords.some((part) => address.includes(part))) {
      const id = getPrimeDistrictId(district);
      if (id != null) return id;
    }
  }

  return undefined;
}

export function resolvePrimeLocationForOrder(
  order: Record<string, unknown>,
  states: Record<string, unknown>[],
  districts: Record<string, unknown>[],
  merchantState?: string,
): { state: string; district: number } | null {
  const state = pickDefaultPrimeState(
    states,
    guessPrimeStateFromOrder(order) || merchantState,
  );
  if (!state || districts.length === 0) return null;

  const district =
    guessPrimeDistrictFromOrder(order, districts) ??
    Number(pickDefaultPrimeDistrict(districts));

  if (!Number.isInteger(district) || district < 1) return null;
  return { state, district };
}

export function getPrimeDistrictLabelById(
  districts: Record<string, unknown>[],
  districtId: number,
): string {
  const match = districts.find((d) => getPrimeDistrictId(d) === districtId);
  return match ? getPrimeDistrictLabel(match) : String(districtId);
}

export function buildCalculateChargesFromOrder(
  order: Record<string, unknown>,
  state: string,
  district: number,
  senderId?: number,
): import("@/api/types/prime").CalculatePrimeChargesInput {
  const shipment = buildPrimeShipmentFromOrder(order, senderId ?? 0, state, district);
  return {
    state,
    district,
    receiptAmtIqd: shipment.receiptAmtIqd,
    senderId,
    receiverName: shipment.receiverName,
    receiverHp1: shipment.receiverHp1,
    locationDetails: shipment.locationDetails,
    productInfo: shipment.productInfo,
    qty: shipment.qty,
  };
}

export function buildPrimeShipmentFromOrder(
  order: Record<string, unknown>,
  senderId: number,
  state: string,
  district: number,
): CreatePrimeShipmentInput {
  const customer = (order.customer as Record<string, unknown> | undefined)?.user as
    | Record<string, unknown>
    | undefined;
  const products = (order.products as Record<string, unknown>[] | undefined) ?? [];
  const pricing = order.pricing as Record<string, unknown> | undefined;

  const productInfo =
    products
      .map((item) => {
        const product = item.product as Record<string, unknown> | undefined;
        const title = (product?.title as string) || "منتج";
        const qty = (item.quantity as number) ?? 1;
        return `${title}*${qty}`;
      })
      .join(", ") || "طلب";

  const qty =
    products.reduce((sum, item) => sum + ((item.quantity as number) ?? 1), 0) ||
    1;

  const orderId = String(order.id ?? "");
  const orderCode =
    (order.order_number as string | undefined) ||
    (order.orderNumber as string | undefined) ||
    `ORD-${orderId.slice(0, 8).toUpperCase()}`;

  return {
    orderId,
    senderId,
    senderSystemCaseIdWithCharacters: orderCode,
    receiverName: (customer?.name as string) || "عميل",
    receiverHp1: formatPhoneForPrime(customer?.phone as string | undefined),
    locationDetails:
      (order.address as string) ||
      (order.nearest_point as string) ||
      "—",
    state,
    district,
    receiptAmtIqd: Number(pricing?.totalPrice ?? 0),
    productInfo: productInfo.slice(0, 200),
    qty,
  };
}
