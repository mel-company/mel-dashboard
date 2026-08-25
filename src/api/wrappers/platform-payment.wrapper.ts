import { useMutation, useQuery } from "@tanstack/react-query";
import { platformPaymentAPI } from "../endpoints/platform-payment.endpoint";
import type { PlatformPaymentInitPayload } from "../endpoints/platform-payment.endpoint";

export const platformPaymentKeys = {
  all: ["platform-payments"] as const,
  detail: (id: string) => [...platformPaymentKeys.all, id] as const,
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
