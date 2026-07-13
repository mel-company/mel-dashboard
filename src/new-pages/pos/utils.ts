export type Product = {
  id: string;
  title: string;
  price: number | null;
  image?: string;
  description?: string;
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
  }>;
};

export type CartItem = {
  product: Product;
  variant?: ProductVariant;
  selectedOptions: Record<string, string>;
  quantity: number;
};

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
  return `${(value ?? 0).toLocaleString("ar-IQ")} د.ع`;
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

import { resolveAssetBaseUrl } from "@/utils/image-url";

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
