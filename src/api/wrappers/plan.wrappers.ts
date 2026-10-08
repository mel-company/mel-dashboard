
import { useQuery } from "@tanstack/react-query";
import { planAPI } from "../endpoints/plan.endpoints";

/**
 * Query key factory for orders
 */
export const planKeys = {
  all: ["plans"] as const,
  lists: () => [...planKeys.all, "list"] as const,
  list: (params?: any) => [...planKeys.lists(), params] as const,
  details: () => [...planKeys.all, "detail"] as const,
  detail: (id: string) => [...planKeys.details(), id] as const,
  search: (params?: any) => [...planKeys.all, "search", params] as const,
};

/**
 * Fetch all plans with optional filtering and pagination
 */
export const useFetchPlans = (params?: any, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: planKeys.list(params),
    queryFn: () => planAPI.fetchAll(params),
    enabled,
  });
};

export const useFetchPlan = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: planKeys.detail(id),
    queryFn: () => planAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};

/** A 403 the server raised about the *plan*, not any other failure. */
const isPlanRefusal = (error: unknown): boolean => {
  const response = (error as { response?: { status?: number; data?: unknown } })
    ?.response;
  if (response?.status !== 403) return false;
  const code = (response.data as { code?: string } | undefined)?.code;
  return code === "PLAN_UPGRADE_REQUIRED";
};

/**
 * Whether the POS surface is open to this store's plan.
 *
 * Three outcomes, not two, and collapsing them is what made the first version
 * wrong: it reported `allowed: false` for *any* non-success, so a network blip
 * or a 500 during a deploy told a paying MEL PLUS merchant that POS was not in
 * their plan — and took the POS data queries down with it.
 *
 * - `undefined` while in flight **and** when the question could not be
 *   answered. The caller treats that as "not known", so an unreachable server
 *   leaves POS exactly as the store setting left it rather than inventing a
 *   plan refusal.
 * - `false` only for the 403 this gate exists to detect.
 * - `true` when the server says so.
 *
 * Those three states are the whole surface. An earlier version also returned an
 * `isUnavailable` flag that no caller read, which invited the belief that the
 * unreachable case was handled distinctly somewhere; it is handled by
 * `undefined`, and saying so twice only made the two descriptions able to
 * disagree.
 *
 * Not retried: a `PLAN_UPGRADE_REQUIRED` 403 is a settled answer about the
 * plan, and retrying it three times only delays the upgrade screen.
 */
export const usePosPlanAccess = (enabled: boolean = true) => {
  const query = useQuery<{ allowed: boolean; feature?: string }>({
    queryKey: [...planKeys.all, "pos-access"],
    queryFn: () => planAPI.posAccess(),
    enabled,
    retry: false,
  });

  const refused = query.isError && isPlanRefusal(query.error);

  return {
    isLoading: query.isLoading,
    /** `undefined` until the server has given an answer we can act on. */
    allowed: query.isSuccess
      ? query.data?.allowed === true
      : refused
        ? false
        : undefined,
  };
};