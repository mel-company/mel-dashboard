import { resolveAssetBaseUrl } from "@/utils/image-url";
import { formatCurrency } from "@/utils/format-currency";

export type Product = {
  id: string;
  title: string;
  price: number | null;
  image?: string;
  description?: string;
  /** Sum of the variants' stock. Only a count when `stockTracked`. */
  stock?: number;
  /** False for a product with no stock row: it sells without limit. */
  stockTracked?: boolean;
  /** Figma overlays a rating chip on the card image. */
  rating?: number;
  /** Figma shows a period trend opposite the price. */
  trendPercent?: number;
  categories?: Array<{
    id: string;
    name: unknown;
    category: { id: string; name: unknown };
  }>;
  options?: Array<{
    id: string;
    name: string;
    values: Array<{
      id: string;
      label: string | null;
      value: string | null;
    }>;
  }>;
  variants?: Array<{
    id: string;
    sku: string;
    qr_code: string;
    price: number | null;
    stock: number;
    image?: string | null;
    optionValues: Array<{
      id: string;
      label: string | null;
      value: string | null;
    }>;
  }>;
};

export type ProductVariant = {
  id: string;
  sku: string;
  qr_code: string;
  price: number | null;
  stock: number;
  image?: string | null;
  optionValues: Array<{
    id: string;
    label: string | null;
    value: string | null;
    option?: { id: string; name: string } | null;
  }>;
};

export type CartItem = {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  /** Units on the shelf when added; `null` when stock is not counted. */
  stock: number | null;
};

/** «أحمر / XL» — a variant named by its option values. */
export function variantLabel(variant: ProductVariant): string {
  return (variant.optionValues ?? [])
    .map((ov) => ov.label || ov.value || "")
    .filter(Boolean)
    .join(" / ");
}

export type Category = {
  id: string;
  name: unknown;
  image?: string | null;
};

export function parseLocalizedName(name: unknown): string {
  if (typeof name === "string") return name;
  if (typeof name === "object" && name !== null) {
    const n = name as Record<string, string | undefined>;
    return n.ar || n.arabic || n.en || n.english || n.name || "";
  }
  return "";
}

export function formatPosPrice(value: number | null | undefined) {
  return formatCurrency(value ?? 0, "0 د.ع");
}

export function getCategoryName(category: unknown): string {
  const c = category as { name?: unknown; category?: { name?: unknown } };
  const name =
    parseLocalizedName(c?.category?.name) || parseLocalizedName(c?.name);
  return name || "غير محدد";
}

export function getDisplayName(name: unknown): string {
  return parseLocalizedName(name);
}

export function resolvePosImageUrl(
  image?: string | null,
  baseUrl?: string | null,
): string {
  if (!image?.trim()) return "";

  const trimmed = image.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const base = resolveAssetBaseUrl(baseUrl);
  const path = trimmed.replace(/^\/+/, "");

  return `${base}/${path}`;
}

/** @deprecated use resolvePosImageUrl */
export function productImageUrl(baseUrl: string, image?: string | null) {
  return resolvePosImageUrl(image, baseUrl);
}

/** 07XXXXXXXXX, 7XXXXXXXXX, 9647XXXXXXXXX or +9647XXXXXXXXX. */
export function isIraqiMobile(raw: string): boolean {
  const digits = raw.replace(/[\s-]/g, "").replace(/^(\+|00)/, "");
  return /^(964|0)?7\d{9}$/.test(digits);
}

/** The coupon check answers in English; the cashier reads Arabic. */
export function posCouponMessage(message?: string | null): string {
  const m = String(message ?? "");
  if (/not found/i.test(m)) return "لا يوجد رمز خصم بهذا الاسم";
  if (/not active/i.test(m)) return "رمز الخصم غير مفعّل";
  if (/not started/i.test(m)) return "رمز الخصم لم يبدأ بعد";
  if (/expired/i.test(m)) return "انتهت صلاحية رمز الخصم";
  if (/usage limit/i.test(m)) return "استُنفد عدد مرات استخدام رمز الخصم";
  const min = m.match(/Minimum order total of ([\d.]+)/i);
  if (min) return `رمز الخصم يتطلب فاتورة لا تقل عن ${formatPosPrice(Number(min[1]))}`;
  return "رمز الخصم غير صالح";
}

/** A refused sale, said in Arabic where the server answered in English. */
export function posErrorMessage(error: any): string {
  const data = error?.response?.data;
  if (data?.code === "PLAN_UPGRADE_REQUIRED") {
    // The server's message names the plan as saved in admin.
    return typeof data.message === "string" && data.message
      ? data.message
      : `نقطة البيع متاحة في باقة ${data.upgrade?.planName || "نمو"}`;
  }
  const raw = Array.isArray(data?.message)
    ? data.message.join("، ")
    : String(data?.message ?? "");
  const stock = raw.match(/Stock is not enough for product (.+?)\. Available: (\d+)/);
  if (stock) return `المخزون لا يكفي لـ«${stock[1]}»، المتبقي ${stock[2]}`;
  if (/not found or does not belong/i.test(raw)) {
    return "أحد المنتجات لم يعد متاحاً، احذفه من الفاتورة وأعد إضافته";
  }
  if (/sold in variants/i.test(raw)) return "اختر نوع المنتج قبل البيع";
  if (/phone/i.test(raw)) return "رقم الهاتف غير صحيح";
  if (raw && /[؀-ۿ]/.test(raw)) return raw;
  return "تعذّر إتمام العملية، حاول مرة أخرى";
}
