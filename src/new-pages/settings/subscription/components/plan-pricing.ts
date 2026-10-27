import type { BillingPeriod } from "@/api/endpoints/platform-payment.endpoint";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Percent off a 3-month or yearly purchase. The plans list sends it under
 * `pricing`, the store subscription's plan as the raw column.
 */
export const periodDiscount = (plan: any, period: BillingPeriod): number => {
  if (!plan) return 0;
  if (period === "QUARTERLY")
    return Number(
      plan.pricing?.quarterly?.discountPercent ??
        plan.quarterly_discount_percent ??
        0,
    );
  if (period === "YEARLY")
    return Number(
      plan.pricing?.yearly?.discountPercent ??
        plan.yearly_discount_percent ??
        0,
    );
  return 0;
};

/** List price for the whole period, before any intro offer. */
export const periodPrice = (plan: any, period: BillingPeriod): number => {
  const monthly = Number(plan?.monthly_price ?? 0);
  if (period === "QUARTERLY")
    return Number(
      plan?.pricing?.quarterly?.price ??
        Math.round(monthly * 3 * (1 - periodDiscount(plan, period) / 100)),
    );
  if (period === "YEARLY")
    return Number(
      plan?.pricing?.yearly?.price ??
        plan?.yearly_price ??
        Math.round(monthly * 12 * (1 - periodDiscount(plan, period) / 100)),
    );
  return monthly;
};
