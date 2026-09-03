import { coerceImagePath, getImageUrl } from "@/utils/image-url";
import { getProductCoverImage } from "@/utils/product-images";
import { formatCurrency } from "@/utils/format-currency";

export type OrderStatusKey =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | string;

export type OrderStatusMeta = {
  label: string;
  className: string;
};

const STATUS_MAP: Record<string, OrderStatusMeta> = {
  PENDING: {
    label: "قيد الانتظار",
    className:
      "bg-amber-500/10 text-[#f57b00] dark:bg-[rgba(245,123,0,0.1)] dark:text-[#f57b00]",
  },
  PROCESSING: {
    label: "قيد المعالجة",
    className:
      "bg-sky-500/10 text-[#00b7ff] dark:bg-[rgba(0,183,255,0.1)] dark:text-[#00b7ff]",
  },
  SHIPPED: {
    label: "قيد التوصيل",
    className:
      "bg-amber-500/10 text-[#f57b00] dark:bg-[rgba(245,123,0,0.1)] dark:text-[#f57b00]",
  },
  DELIVERED: {
    label: "تم التوصيل",
    className:
      "bg-emerald-500/10 text-[#00b88a] dark:bg-[rgba(0,184,138,0.1)] dark:text-[#00b88a]",
  },
  CANCELLED: {
    label: "مرفوض",
    className:
      "bg-rose-500/10 text-[#ff5252] dark:bg-[rgba(255,82,82,0.1)] dark:text-[#ff5252]",
  },
};

export function getOrderStatusMeta(status?: string | null): OrderStatusMeta {
  if (!status) {
    return {
      label: "—",
      className:
        "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-[#a4b1fa]",
    };
  }
  return (
    STATUS_MAP[status.toUpperCase()] ?? {
      label: status,
      className:
        "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-[#a4b1fa]",
    }
  );
}

export function formatOrderCode(id?: string | number | null) {
  if (id == null) return "#ORD-????";
  const raw = String(id).replace(/[^a-zA-Z0-9]/g, "");
  const short = raw.slice(0, 4).toUpperCase() || "????";
  return `#ORD-${short}`;
}

export function formatOrderDateParts(dateString?: string | null) {
  if (!dateString) return { date: "—", time: "" };
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return { date: "—", time: "" };

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { date: `${day}/${month}/${year}`, time };
}

export function formatOrderAmount(amount?: number | null) {
  return formatCurrency(amount);
}

export function getOrderTotal(order: any, fallbackCalculate?: (products: any[]) => number) {
  const priced =
    order?.pricing?.totalPrice ??
    order?.pricing?.subtotalAfterProductDiscounts ??
    order?.totalPrice ??
    order?.total;
  if (priced != null && !Number.isNaN(Number(priced))) return Number(priced);
  if (fallbackCalculate) return fallbackCalculate(order?.products ?? []);
  return 0;
}

export function getOrderPaymentLabel(order: any): {
  label: string;
  className: string;
} {
  const raw =
    order?.paymentMethod?.name ??
    order?.paymentMethod?.title ??
    order?.payment?.name ??
    order?.paymentType?.name ??
    order?.payment_method ??
    order?.paymentType ??
    "";

  const cashOnDelivery =
    order?.cashOnDelivery === true ||
    order?.cash_on_delivery === true ||
    order?.payOnDelivery === true;

  const text = String(raw || (cashOnDelivery ? "دفع عند الاستلام" : "")).trim();
  const lower = text.toLowerCase();

  if (!text) {
    return { label: "—", className: "text-slate-400 dark:text-[#a4b1fa]" };
  }

  if (
    cashOnDelivery ||
    text.includes("استلام") ||
    lower.includes("cod") ||
    lower.includes("delivery")
  ) {
    return {
      label: text.includes("استلام") ? text : "دفع عند الاستلام",
      className: "text-[#f57b00]",
    };
  }

  if (text.includes("نقد") || lower.includes("cash")) {
    return { label: text, className: "text-[#00b88a]" };
  }

  if (
    text.includes("فيزا") ||
    text.includes("ماستر") ||
    text.includes("بطاقة") ||
    lower.includes("visa") ||
    lower.includes("card") ||
    lower.includes("master")
  ) {
    return { label: text, className: "text-[#00b7ff]" };
  }

  return { label: text, className: "text-[#8e9dff]" };
}

function parseLocalizedName(name: unknown): string {
  if (typeof name === "string") return name.trim();
  if (typeof name === "object" && name !== null) {
    const n = name as Record<string, string | undefined>;
    return (
      n.arabic?.trim() ||
      n.ar?.trim() ||
      n.english?.trim() ||
      n.en?.trim() ||
      n.name?.trim() ||
      ""
    );
  }
  return "";
}

/** Figma address cell: primary = city/state, secondary = region - landmark */
export function getOrderAddressParts(order: any): {
  primary: string;
  secondary: string;
} {
  const stateName = parseLocalizedName(order?.state?.name);
  const regionName = parseLocalizedName(order?.region?.name);
  const landmark = String(
    order?.nearest_point || order?.address || order?.deliveryAddress || "",
  ).trim();

  // Preferred: state on top, region + landmark below (matches Figma بغداد / الكرادة - ...)
  if (stateName) {
    const secondary = [regionName, landmark].filter(Boolean).join(" - ");
    return { primary: stateName, secondary };
  }

  if (regionName) {
    return {
      primary: regionName,
      secondary: landmark && landmark !== regionName ? landmark : "",
    };
  }

  if (landmark) {
    return { primary: landmark, secondary: "" };
  }

  return { primary: "—", secondary: "" };
}

export function getOrderCity(order: any) {
  return getOrderAddressParts(order).primary;
}

export function getOrderAddressLine(order: any) {
  const { secondary } = getOrderAddressParts(order);
  return secondary || "—";
}

/** Raw image path/URL for an order line item (not a built CDN URL). */
export function getOrderLineImagePath(item: any): string {
  const candidates = [
    item?.variant?.image,
    item?.image,
    item?.productImage,
    item?.thumbnail,
    getProductCoverImage(item?.product),
    item?.product?.image,
    getProductCoverImage(item?.variant?.product),
    item?.variant?.product?.image,
    item?.product?.images?.[0]?.url,
    item?.product?.images?.[0],
  ];

  for (const candidate of candidates) {
    const path = coerceImagePath(candidate);
    if (path) return path;
  }
  return "";
}

export function getOrderProductImagePaths(order: any, max = 5): string[] {
  const products = Array.isArray(order?.products)
    ? order.products
    : Array.isArray(order?.orderProducts)
      ? order.orderProducts
      : Array.isArray(order?.items)
        ? order.items
        : [];

  const paths: string[] = [];
  for (const item of products) {
    if (paths.length >= max) break;
    const path = getOrderLineImagePath(item);
    if (path && !paths.includes(path)) paths.push(path);
  }
  return paths;
}

/** @deprecated Prefer getOrderProductImagePaths + AssetImage */
export function getOrderProductImages(
  order: any,
  imageBaseUrl?: string | null,
  max = 5,
): string[] {
  const base = imageBaseUrl || order?.baseUrl;
  return getOrderProductImagePaths(order, max)
    .map((path) => getImageUrl(path, base))
    .filter(Boolean);
}

export function getOrderProductCount(order: any) {
  if (typeof order?._count?.products === "number") return order._count.products;
  const products = Array.isArray(order?.products) ? order.products : [];
  return products.reduce(
    (sum: number, p: any) => sum + (Number(p?.quantity) || 1),
    0,
  ) || products.length;
}

export function getOrderDiscountPercent(order: any): number | null {
  const percent =
    order?.pricing?.discountPercentage ??
    order?.discountPercentage ??
    order?.appliedRedemptions?.[0]?.discount?.discount_percentage ??
    order?.products?.[0]?.product?.discounts?.[0]?.discount?.discount_percentage;

  if (percent == null || Number.isNaN(Number(percent))) return null;
  const value = Number(percent);
  return value > 0 ? value : null;
}
