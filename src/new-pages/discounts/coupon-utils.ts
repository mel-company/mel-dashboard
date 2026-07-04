import type { CouponListItem } from "@/api/types/coupon";

export function formatCouponValue(coupon: CouponListItem): string {
  if (coupon.type === "FIXED") {
    return `${coupon.value.toLocaleString("ar-IQ")} د.ع`;
  }
  return `${coupon.value}%`;
}

export function formatAppliesTo(appliesTo?: string | null): string {
  const map: Record<string, string> = {
    ALL: "الكل",
    PRODUCT: "منتجات محددة",
    CATEGORY: "فئات محددة",
  };
  return map[appliesTo ?? "ALL"] ?? appliesTo ?? "الكل";
}

export function formatCouponDate(dateString?: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ar-IQ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCouponDateTime(dateString?: string | null): string {
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

export function isCouponExpired(coupon: CouponListItem): boolean {
  if (!coupon.expiresAt) return false;
  return new Date(coupon.expiresAt) < new Date();
}

export function isCouponNotStarted(coupon: CouponListItem): boolean {
  if (!coupon.startsAt) return false;
  return new Date(coupon.startsAt) > new Date();
}

export function getCouponStatusMeta(coupon: CouponListItem) {
  if (!coupon.isActive) {
    return {
      label: "معطل",
      badgeClass: "bg-amber-500 text-white",
      switchChecked: false,
      switchDisabled: false,
    };
  }
  if (isCouponExpired(coupon)) {
    return {
      label: "منتهي",
      badgeClass: "bg-red-500 text-white",
      switchChecked: false,
      switchDisabled: true,
    };
  }
  if (isCouponNotStarted(coupon)) {
    return {
      label: "لم يبدأ",
      badgeClass: "bg-slate-400 text-white",
      switchChecked: false,
      switchDisabled: false,
    };
  }
  return {
    label: "فعال",
    badgeClass: "bg-emerald-500 text-white",
    switchChecked: true,
    switchDisabled: false,
  };
}

export function getCouponUsageCount(coupon: CouponListItem): number {
  return coupon.usedCount ?? coupon._count?.redemptions ?? 0;
}

export function formatCouponUsage(coupon: CouponListItem): string {
  const used = getCouponUsageCount(coupon);
  const limit = coupon.usageLimit;
  if (limit != null && limit > 0) {
    return `${used}/${limit}`;
  }
  return String(used);
}

export function getCouponScopeLabel(coupon: CouponListItem): string {
  const products = coupon._count?.products ?? 0;
  const categories = coupon._count?.categories ?? 0;
  const applies = formatAppliesTo(coupon.appliesTo);
  if (products === 0 && categories === 0) return applies;
  return `${applies} • ${products} منتج • ${categories} فئة`;
}
