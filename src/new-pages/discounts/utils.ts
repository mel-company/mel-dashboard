import { DISCOUNT_STATUS } from "@/utils/constants";
import type { DiscountListItem } from "@/api/types/discount";

export function getDiscountStatusMeta(status?: string) {
  switch (status) {
    case DISCOUNT_STATUS.ACTIVE:
      return {
        label: "فعال",
        badgeClass: "bg-emerald-500 text-white",
        switchChecked: true,
        switchDisabled: false,
        activeLabel: "مفعل",
        disabledLabel: "معطل",
      };
    case DISCOUNT_STATUS.INACTIVE:
      return {
        label: "معطل",
        badgeClass: "bg-amber-500 text-white",
        switchChecked: false,
        switchDisabled: false,
        activeLabel: "مفعل",
        disabledLabel: "معطل",
      };
    case DISCOUNT_STATUS.EXPIRED:
      return {
        label: "منتهي",
        badgeClass: "bg-red-500 text-white",
        switchChecked: false,
        switchDisabled: true,
        activeLabel: "منتهي",
        disabledLabel: "منتهي",
      };
    default:
      return {
        label: status ?? "—",
        badgeClass: "bg-slate-500 text-white",
        switchChecked: false,
        switchDisabled: true,
        activeLabel: "—",
        disabledLabel: "—",
      };
  }
}

export function formatDiscountDate(dateString?: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ar-IQ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDiscountDateTime(dateString?: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  const datePart = date.toLocaleDateString("ar-IQ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timePart = date.toLocaleTimeString("ar-IQ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart}، ${timePart}`;
}

export function getDiscountScope(discount: DiscountListItem): string {
  const products =
    discount._count?.products ?? discount.discount_products?.length ?? 0;
  const categories =
    discount._count?.categories ?? discount.discount_categories?.length ?? 0;

  if (products === 0 && categories === 0) return "غير مخصص بعد";
  return `${products} منتجاً • ${categories} فئة`;
}

export function getDiscountUsageCount(discount: DiscountListItem): number {
  return (
    discount.usage_count ??
    discount._count?.redemptions ??
    discount._count?.orders ??
    0
  );
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString("ar-IQ")} د.ع`;
}

/** Junction rows from GET /discount/:id use nested product/category objects. */
export function extractDiscountProductIds(products?: unknown[] | null): string[] {
  if (!Array.isArray(products)) return [];

  return products
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const item = row as {
        id?: string;
        productId?: string;
        product?: { id?: string };
      };
      return item.product?.id ?? item.productId ?? item.id ?? null;
    })
    .filter((id): id is string => typeof id === "string" && id.length > 0);
}

export function extractDiscountCategoryIds(
  categories?: unknown[] | null,
): string[] {
  if (!Array.isArray(categories)) return [];

  return categories
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const item = row as {
        id?: string;
        categoryId?: string;
        category?: { id?: string };
      };
      return item.category?.id ?? item.categoryId ?? item.id ?? null;
    })
    .filter((id): id is string => typeof id === "string" && id.length > 0);
}

export function sanitizeIdList(ids?: unknown[] | null): string[] {
  if (!Array.isArray(ids)) return [];
  return ids.filter(
    (id): id is string => typeof id === "string" && id.length > 0,
  );
}
