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

/** Currently offered to merchants — Modon / Al-Waseet / Boxy are withheld. */
export const OFFERED_COURIER_CODES = new Set(["alzaeem", "prime"]);

export function isOfferedDeliveryCompany(
  company: Pick<DeliveryCompany, "code"> | null | undefined,
): boolean {
  const code = company?.code?.trim().toLowerCase();
  return !!code && OFFERED_COURIER_CODES.has(code);
}

/**
 * Fetch delivery companies offered in the dashboard picker.
 *
 * The API already returns only الزعيم + برايم; this filter is a belt-and-braces
 * so an older catalogue cannot surface مدن / الوسيط / بوكسي in the UI.
 * `PUT /settings/delivery-company` also refuses anything else.
 */
export const useFetchDeliveryCompanies = (enabled: boolean = true) => {
  return useQuery<DeliveryCompany[]>({
    queryKey: deliveryCompanyKeys.list(),
    queryFn: async () => {
      const all = await deliveryCompanyAPI.fetchAll();
      return all.filter(isOfferedDeliveryCompany);
    },
    enabled,
  });
};
