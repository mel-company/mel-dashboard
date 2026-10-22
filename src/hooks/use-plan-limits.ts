import { useQuery } from "@tanstack/react-query";
import { planKeys } from "@/api/wrappers/plan.wrappers";
import {
  planAPI,
  type LimitedResource,
  type PlanEntitlementsResponse,
  type PlanFeatureKey,
  type PlanLimitErrorBody,
} from "@/api/endpoints/plan.endpoints";

/**
 * The entitlements, refetched whenever a screen that shows a cap mounts.
 *
 * Same query as `useFetchEntitlements`, but that one is cached for a minute,
 * which is right for feature locks and wrong for counts: a merchant who adds
 * their 50th product and goes back to the list should see the cap there, not a
 * minute later.
 */
export function usePlanUsage(enabled = true) {
  return useQuery<PlanEntitlementsResponse>({
    queryKey: planKeys.entitlements(),
    queryFn: () => planAPI.fetchEntitlements(),
    enabled,
    staleTime: 60_000,
    refetchOnMount: "always",
  });
}

/** One cap with its usage, or `null` while loading / when it is unlimited. */
export function usePlanLimit(resource: LimitedResource) {
  const { data } = usePlanUsage();
  const usage = data?.limits?.[resource];
  if (!usage || usage.limit === null) return null;
  return usage;
}

/**
 * Whether the store's plan, in force, has a Grow-only feature. `true` while
 * loading and on a server that does not report features yet, so nothing is
 * hidden from a store that has it; the server enforces it either way.
 */
export function usePlanFeature(feature: PlanFeatureKey): boolean {
  const { data } = usePlanUsage();
  return data?.features ? Boolean(data.features[feature]) : true;
}

/** The 403 a create gets at a plan cap. */
export function isPlanLimitError(
  err: unknown,
): err is { response: { data: PlanLimitErrorBody; status: 403 } } {
  const data = (err as { response?: { data?: Partial<PlanLimitErrorBody> } })
    ?.response?.data;
  return data?.code === "PLAN_LIMIT_REACHED";
}

/** The 402 answers once the subscription term has ended (any lifecycle phase). */
export function isSubscriptionExpiredError(err: unknown): boolean {
  const code = (err as { response?: { data?: { code?: string } } })?.response
    ?.data?.code;
  return (
    code === "SUBSCRIPTION_EXPIRED" ||
    code === "SUBSCRIPTION_VIEW_ONLY" ||
    code === "SUBSCRIPTION_FROZEN"
  );
}
