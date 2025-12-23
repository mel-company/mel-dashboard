
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