import { useMutation, useQuery } from "@tanstack/react-query";
import { platformPaymentAPI } from "../endpoints/platform-payment.endpoint";
import type { PlatformPaymentInitPayload } from "../endpoints/platform-payment.endpoint";

export const platformPaymentKeys = {
  all: ["platform-payments"] as const,
  detail: (id: string) => [...platformPaymentKeys.all, id] as const,
  providers: () => [...platformPaymentKeys.all, "providers"] as const,
};

/**
 * Which gateways the platform is accepting for billing right now.
 *
 * Cached for the session rather than per mount: it changes only when an
 * operator moves a switch in the admin dashboard, and the picker is rendered
 * inside a dialog the merchant may open several times.
 */
export const useBillingProviders = () => {
  return useQuery({
    queryKey: platformPaymentKeys.providers(),
    queryFn: () => platformPaymentAPI.listStoreProviders(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useInitStorePlatformPayment = () => {
  return useMutation({
    mutationFn: (payload: PlatformPaymentInitPayload) =>
      platformPaymentAPI.initStore(payload),
  });
};

export const useStorePlatformPaymentStatus = (
  id: string | null,
  enabled = true,
) => {
  return useQuery({
    queryKey: platformPaymentKeys.detail(id || ""),
    queryFn: () => platformPaymentAPI.getStoreStatus(id!),
    enabled: enabled && !!id,
    refetchInterval: (query) => {
      const status = (query.state.data as { status?: string } | undefined)
        ?.status;
      if (status === "PENDING") return 3000;
      return false;
    },
  });
};
