import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import type { TamimaPageContext } from "@/api/endpoints/tamima.endpoints";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string | undefined): value is string {
  return !!value && UUID_RE.test(value);
}

/**
 * Structured focus for Tamima so «هذا المنتج» binds to the open screen.
 * Always pair with `autoApply: false` — writes need merchant approve.
 */
export function useTamimaPageContext(): TamimaPageContext {
  const location = useLocation();
  const params = useParams();

  return useMemo(() => {
    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);
    const root = segments[0] || "dashboard";
    const id = params.id;

    if (root === "products") {
      if (segments[1] === "add") {
        return { route: "product-add", label: "إضافة منتج" };
      }
      if (isUuid(id) && segments[2] === "edit") {
        return {
          route: "product-edit",
          label: "تعديل منتج",
          productId: id,
        };
      }
      if (isUuid(id)) {
        return {
          route: "product-detail",
          label: "تفاصيل منتج",
          productId: id,
        };
      }
      return { route: "products", label: "المنتجات" };
    }

    if (root === "orders") {
      if (isUuid(id)) {
        return { route: "order-detail", label: "تفاصيل طلب", orderId: id };
      }
      return { route: "orders", label: "الطلبات" };
    }

    if (root === "categories") {
      if (isUuid(id)) {
        return {
          route: "category-detail",
          label: "قسم",
          categoryId: id,
        };
      }
      return { route: "categories", label: "الأقسام" };
    }

    if (root === "customers") {
      return isUuid(id)
        ? { route: "customer-detail", label: "عميل" }
        : { route: "customers", label: "العملاء" };
    }

    if (root === "settings") {
      return { route: "settings", label: "الإعدادات" };
    }

    if (root === "editor") {
      return { route: "editor", label: "المحرر" };
    }

    if (root === "discounts" || root === "coupons") {
      return { route: "discounts", label: "الخصومات والكوبونات" };
    }

    return {
      route: root,
      label: root,
      hint: path.slice(0, 500),
    };
  }, [location.pathname, params.id]);
}
