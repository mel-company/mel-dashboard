import { useQuery } from "@tanstack/react-query";
import { deliveryCompanyAPI } from "../endpoints/delivery-company.endpoints";
import type { DeliveryCompany } from "@/api/types/delivery-company";

/**
 * شركات التوصيل المتاحة.
 *
 * One query, because choosing is all a merchant does with a delivery company.
 * The create/update/delete mutations that used to live here wrapped
 * `SystemUserJwtAuthGuard` routes and could only ever answer 401 — and one of
 * them was a second `useUpdateDeliveryCompany`, colliding by name with the one
 * in `settings.wrappers` that actually assigns the store's courier. Two hooks
 * with one name, one of them dead, is how the wrong one gets imported.
 */
export const deliveryCompanyKeys = {
  all: ["delivery-companies"] as const,
  lists: () => [...deliveryCompanyKeys.all, "list"] as const,
  list: () => [...deliveryCompanyKeys.lists()] as const,
};

/**
 * Fetch all delivery companies.
 *
 * Typed as the list rather than `any`, so a consumer that treats the
 * pagination envelope as an array fails at the compiler instead of on the
 * render after the answer arrives.
 */
export const useFetchDeliveryCompanies = (enabled: boolean = true) => {
  return useQuery<DeliveryCompany[]>({
    queryKey: deliveryCompanyKeys.list(),
    queryFn: () => deliveryCompanyAPI.fetchAll(),
    enabled,
  });
};
