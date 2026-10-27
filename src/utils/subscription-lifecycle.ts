/** Matches backend `SubscriptionLifecyclePhase`. */
export type SubscriptionLifecyclePhase =
  | "ACTIVE"
  | "VIEW_ONLY"
  | "FROZEN"
  | "PURGE_DUE";

export type SubscriptionLifecycleErrorCode =
  | "SUBSCRIPTION_EXPIRED"
  | "SUBSCRIPTION_VIEW_ONLY"
  | "SUBSCRIPTION_FROZEN"
  | "SUBSCRIPTION_STOREFRONT_VIEW_ONLY";

/** Paths a FROZEN merchant may still open in the dashboard. */
const FROZEN_ALLOWED_PREFIXES = [
  "/settings/subscription",
  "/settings/store",
  "/payment",
  "/tickets",
  "/plans",
] as const;

export function isFrozenPhase(
  phase?: string | null,
): phase is "FROZEN" | "PURGE_DUE" {
  return phase === "FROZEN" || phase === "PURGE_DUE";
}

export function isViewOnlyPhase(phase?: string | null): phase is "VIEW_ONLY" {
  return phase === "VIEW_ONLY";
}

export function isFrozenAllowedPath(pathname: string): boolean {
  const path = pathname.split("?")[0] || "/";
  return FROZEN_ALLOWED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function subscriptionLifecycleErrorCode(
  err: unknown,
): SubscriptionLifecycleErrorCode | null {
  const code = (err as { response?: { data?: { code?: string } } })?.response
    ?.data?.code;
  if (
    code === "SUBSCRIPTION_EXPIRED" ||
    code === "SUBSCRIPTION_VIEW_ONLY" ||
    code === "SUBSCRIPTION_FROZEN" ||
    code === "SUBSCRIPTION_STOREFRONT_VIEW_ONLY"
  ) {
    return code;
  }
  return null;
}
