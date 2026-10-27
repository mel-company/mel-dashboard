/**
 * What a plan includes and its intro offer, as lines for a price table.
 *
 * Moved out of the old `/plans` page. The server builds `card_lines` as set in
 * admin; the builder below is the fallback for a server older than them, and
 * the same fallback exists in owner-dash and mel.iq, so keep the three in sync.
 */

const capLine = (limit: number | null | undefined, unit: string, plural: string) =>
  limit === null || limit === undefined
    ? `${plural} بلا حدود`
    : `حتى ${limit} ${unit}`;

/** The plan's grant in lines, from its columns (caps, AI, features). */
export function planHighlights(plan: any): string[] {
  if (Array.isArray(plan?.card_lines)) return plan.card_lines;
  const lines = [
    capLine(plan.max_products, "منتج", "منتجات"),
    capLine(plan.max_categories, "قسم", "أقسام"),
    capLine(plan.max_category_groups, "مجموعة أقسام", "مجموعات أقسام"),
    capLine(plan.max_coupons, "كوبون", "كوبونات"),
    capLine(plan.max_monthly_orders, "طلب شهرياً", "طلبات"),
  ];
  if (plan.ai_store_credits > 0) {
    lines.push(`${plan.ai_store_credits} متاجر بالذكاء الاصطناعي شهرياً`);
  } else if (plan.ai_store_trial > 0) {
    lines.push("تجربة مجانية واحدة لإنشاء متجر بالذكاء الاصطناعي");
  }
  if (plan.has_ai_editor && plan.ai_editor_credits > 0) {
    lines.push(`${plan.ai_editor_credits} رصيد شهرياً لمساعد المحرر الذكي`);
  } else if (plan.ai_editor_trial > 0) {
    lines.push(`تجربة مساعد المحرر الذكي (${plan.ai_editor_trial} رسائل)`);
  }
  // These three default to on; a server older than the columns omits them.
  if (plan.has_online_payment !== false) lines.push("الدفع الإلكتروني: زين كاش وكي كارد");
  if (plan.has_courier_integrations !== false) lines.push("ربط شركات الشحن وإرسال الطلبات تلقائياً");
  if (plan.has_advanced_stats !== false) lines.push("إحصائيات وتقارير متقدمة");
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
    parts.push(intro.freeMonths === 1 ? "أول شهر مجاناً" : `أول ${intro.freeMonths} أشهر مجاناً`);
  }
  if (intro.discountMonths > 0 && intro.discountPercent > 0) {
    parts.push(
      `خصم ${intro.discountPercent}% لمدة ${intro.discountMonths === 1 ? "شهر" : `${intro.discountMonths} أشهر`}`,
    );
  }
  return parts.length ? `للمشتركين الجدد: ${parts.join("، ثم ")}` : null;
}
