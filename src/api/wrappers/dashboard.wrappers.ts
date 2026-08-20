import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "../endpoints/dashboard.endpoints";
import type {
  DashboardHomeQuery,
  DashboardHomeResponse,
} from "@/api/types/dashboard";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  home: (params?: DashboardHomeQuery) =>
    [...dashboardKeys.all, "home", params ?? {}] as const,
};

export const useFetchDashboardHome = (
  params?: DashboardHomeQuery,
  options?: { enabled?: boolean },
) => {
  return useQuery<DashboardHomeResponse>({
    queryKey: dashboardKeys.home(params),
    queryFn: () => dashboardAPI.getHome(params),
    enabled: options?.enabled ?? true,
  });
};
