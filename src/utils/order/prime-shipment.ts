import type { CreatePrimeShipmentInput } from "@/api/types/prime";
import type { OrderPrimeShipment } from "@/api/types/order-prime";

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
    receiverHp1: (customer?.phone as string) || "07700000000",
    locationDetails: (order.nearest_point as string) || "—",
    state,
    district,
    receiptAmtIqd: Number(pricing?.totalPrice ?? 0),
    productInfo,
    qty,
  };
}
