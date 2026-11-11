/**
 * What a plan includes and its intro offer, as lines for a price table.
 *
 * Moved out of the old `/plans` page. The server builds `card_lines` as set in
 * admin; the builder below is the fallback for a server older than them, and
 * the same fallback exists in owner-dash and mel.iq, so keep the three in sync.
 */

import type { PlanEntitlementsResponse } from "@/api/endpoints/plan.endpoints";

const capLine = (
  limit: number | null | undefined,
  unit: string,
  plural: string,
) =>
  limit === null || limit === undefined
    ? `${plural} بلا حدود`
    : `حتى ${limit} ${unit}`;

const usersLine = (maxUsers: number | null | undefined) => {
  if (maxUsers === null || maxUsers === undefined) return null;
  if (maxUsers <= 1) return "شخص واحد يدير المتجر";
  return `حتى ${maxUsers} موظفين`;
};

/** Marketing lines for the plans picker (admin `card_lines` or column fallback). */
export function planHighlights(plan: any): string[] {
  if (Array.isArray(plan?.card_lines) && plan.card_lines.length > 0) {
    return plan.card_lines;
  }
  return buildFromPlanColumns(plan);
}

/**
 * «المميزات الفعّالة» on the subscription page — what THIS store's plan
 * actually grants (entitlements + plan columns), not admin marketing copy.
 */
export function planActiveFeatures(
  plan: any,
  entitlements?: PlanEntitlementsResponse | null,
): string[] {
  const limits = entitlements?.limits;
  const feats = entitlements?.features;
  const ent = entitlements?.entitlements;
  const trials = entitlements?.trials;

  if (limits || feats || ent) {
    const lines: string[] = [];

    if (limits?.products) {
      lines.push(capLine(limits.products.limit, "منتج", "منتجات"));
    }
    if (limits?.categories) {
      lines.push(capLine(limits.categories.limit, "قسم", "أقسام"));
    }
    if (limits?.categoryGroups) {
      lines.push(
        capLine(limits.categoryGroups.limit, "مجموعة أقسام", "مجموعات أقسام"),
      );
    }
    if (limits?.coupons) {
      lines.push(capLine(limits.coupons.limit, "كوبون", "كوبونات"));
    }
    if (limits?.monthlyOrders) {
      lines.push(
        capLine(limits.monthlyOrders.limit, "طلب شهرياً", "طلبات"),
      );
    }

    const seats = usersLine(ent?.max_users ?? plan?.max_users);
    if (seats) lines.push(seats);

    if ((ent?.ai_store_credits ?? 0) > 0) {
      lines.push(
        `${ent!.ai_store_credits} متاجر بالذكاء الاصطناعي شهرياً`,
      );
    } else if ((trials?.aiStore ?? 0) > 0) {
      lines.push("تجربة مجانية واحدة لإنشاء متجر بالذكاء الاصطناعي");
    }

    if (ent?.has_ai_editor && (ent.ai_editor_credits ?? 0) > 0) {
      lines.push(`${ent.ai_editor_credits} رصيد شهرياً لمساعد المحرر الذكي`);
    } else if ((trials?.aiEditor ?? 0) > 0) {
      lines.push(
        `تجربة مساعد المحرر الذكي (${trials!.aiEditor} رسائل)`,
      );
    }

    if (feats?.online_payment) {
      lines.push("الدفع الإلكتروني: زين كاش وكي كارد");
    }
    if (feats?.courier_integrations) {
      lines.push("ربط شركات الشحن وإرسال الطلبات تلقائياً");
    }
    if (feats?.advanced_stats) {
      lines.push("إحصائيات وتقارير متقدمة");
    }
    if (feats?.social_pixels) {
      lines.push("بكسلات الإعلانات (ميتا، تيك توك، سناب)");
    }
    if (feats?.custom_domain) {
      lines.push("ربط نطاقك الخاص");
    }
    if (ent?.has_mobile_app) {
      lines.push("تطبيق التاجر على الهاتف");
    }
    // POS is not on entitlements.features — only show when the plan grants it.
    if (plan?.has_pos === true) {
      lines.push("نقطة البيع POS");
    }

    if (lines.length > 0) return lines;
  }

  // No entitlements payload: build from this plan's columns only (strict flags).
  return buildFromPlanColumns(plan, { strictFlags: true });
}

/** Column-based lines when `card_lines` / entitlements are missing. */
function buildFromPlanColumns(
  plan: any,
  opts?: { strictFlags?: boolean },
): string[] {
  if (!plan) return [];
  const strict = opts?.strictFlags === true;
  const on = (flag: boolean | undefined) =>
    strict ? flag === true : flag !== false;

  const lines = [
    capLine(plan.max_products, "منتج", "منتجات"),
    capLine(plan.max_categories, "قسم", "أقسام"),
    capLine(plan.max_category_groups, "مجموعة أقسام", "مجموعات أقسام"),
    capLine(plan.max_coupons, "كوبون", "كوبونات"),
    capLine(plan.max_monthly_orders, "طلب شهرياً", "طلبات"),
  ];

  const seats = usersLine(plan.max_users);
  if (seats) lines.push(seats);

  if (plan.ai_store_credits > 0) {
    lines.push(`${plan.ai_store_credits} متاجر بالذكاء الاصطناعي شهرياً`);
  } else if (plan.ai_store_trial > 0) {
    lines.push("تجربة مجانية واحدة لإنشاء متجر بالذكاء الاصطناعي");
  }
  if (plan.has_ai_editor && plan.ai_editor_credits > 0) {
    lines.push(`${plan.ai_editor_credits} رصيد شهرياً لمساعد المحرر الذكي`);
  } else if (plan.ai_editor_trial > 0) {
    lines.push(
      `تجربة مساعد المحرر الذكي (${plan.ai_editor_trial} رسائل)`,
    );
  }

  if (on(plan.has_online_payment)) {
    lines.push("الدفع الإلكتروني: زين كاش وكي كارد");
  }
  if (on(plan.has_courier_integrations)) {
    lines.push("ربط شركات الشحن وإرسال الطلبات تلقائياً");
  }
  if (on(plan.has_advanced_stats)) {
    lines.push("إحصائيات وتقارير متقدمة");
  }
  if (plan.has_social_pixels) lines.push("بكسلات الإعلانات (ميتا، تيك توك، سناب)");
  if (plan.has_custom_domain) lines.push("ربط نطاقك الخاص");
  if (plan.has_mobile_app) lines.push("تطبيق التاجر على الهاتف");
  if (plan.has_pos) lines.push("نقطة البيع POS");
  return lines;
}

/** The intro offer in one line, or null when there is none. */
export function introText(plan: any): string | null {
  const intro = plan.pricing?.monthly?.intro;
  if (!intro?.enabled) return null;
  const parts: string[] = [];
  if (intro.freeMonths > 0) {
    parts.push(
      intro.freeMonths === 1
        ? "أول شهر مجاناً"
        : `أول ${intro.freeMonths} أشهر مجاناً`,
    );
  }
  if (intro.discountMonths > 0 && intro.discountPercent > 0) {
    parts.push(
      `خصم ${intro.discountPercent}% لمدة ${intro.discountMonths === 1 ? "شهر" : `${intro.discountMonths} أشهر`}`,
    );
  }
  return parts.length ? `للمشتركين الجدد: ${parts.join("، ثم ")}` : null;
}
