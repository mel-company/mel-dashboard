import { useQuery } from "@tanstack/react-query";
import {
  planAPI,
  type PlanEntitlementsResponse,
  type PlusFeature,
} from "../endpoints/plan.endpoints";

/**
 * Query key factory for plans / entitlements
 */
export const planKeys = {
  all: ["plans"] as const,
  lists: () => [...planKeys.all, "list"] as const,
  list: (params?: any) => [...planKeys.lists(), params] as const,
  details: () => [...planKeys.all, "detail"] as const,
  detail: (id: string) => [...planKeys.details(), id] as const,
  search: (params?: any) => [...planKeys.all, "search", params] as const,
  entitlements: () => [...planKeys.all, "entitlements"] as const,
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

/** Current store plan entitlements + locked PLUS features. */
export const useFetchEntitlements = (enabled: boolean = true) => {
  return useQuery<PlanEntitlementsResponse>({
    queryKey: planKeys.entitlements(),
    queryFn: () => planAPI.fetchEntitlements(),
    enabled,
    staleTime: 60_000,
  });
};

export const isFeatureLocked = (
  data: PlanEntitlementsResponse | undefined,
  feature: PlusFeature,
): boolean => Boolean(data?.locked?.some((item) => item.feature === feature));

export const lockedFeatureMessage = (
  data: PlanEntitlementsResponse | undefined,
  feature: PlusFeature,
): string | undefined =>
  data?.locked?.find((item) => item.feature === feature)?.message;