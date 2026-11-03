import { useCourierSetup } from "@/api/wrappers/shipping.wrappers";
import type {
  CourierSetup,
  CourierSetupAction,
  CourierSetupRequirement,
} from "@/api/types/shipping";

export type { CourierSetup, CourierSetupAction, CourierSetupRequirement };

/**
 * شروط تفعيل الشحن من السيرفر — نفس الشكل لكل الشركات.
 *
 * `GET /shipping/couriers/setup` هو المصدر؛ الواجهة ترسم القائمة وتترجم
 * `action` إلى زر فقط.
 */
export function useCourierSetupStatus(code?: string, enabled = true) {
  const query = useCourierSetup(code, enabled);

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    setup: query.data ?? null,
    ready: query.data?.ready ?? false,
    requirements: query.data?.requirements ?? [],
    next: query.data?.next ?? null,
    summaryAr: query.data?.summaryAr ?? "",
    courierCode: query.data?.courierCode ?? null,
    displayName: query.data?.displayName ?? query.data?.companyName ?? null,
  };
}
