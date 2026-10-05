import axiosInstance from "@/utils/AxiosInstance";

export type PlatformPaymentProvider = "QI_CARD" | "ZAIN_CASH";

/**
 * A gateway the platform will actually accept a payment through right now.
 *
 * The server decides the list: it applies the operator's «اشتراكات العملاء»
 * switch and drops any gateway whose credentials are unset. This file used to
 * hold the two codes in an array and offer both unconditionally, so a gateway
 * the operator had withdrawn was still a button — and the merchant found out
 * by being refused after choosing it, after the price was computed and a
 * payment row existed.
 */
export type BillingProvider = {
  provider: PlatformPaymentProvider;
  /** The gateway's own brand name, so no client keeps a code → name table. */
  name: string;
  logoUrl: string;
  /** What an omitted `provider` would resolve to on the server. */
  recommended: boolean;
};

export type PlatformPaymentInitPayload = {
  type:
    | "INITIAL_SUBSCRIPTION"
    | "RENEWAL"
    | "CHANGE_PLAN"
    | "DOMAIN_REGISTRATION";
  /** Required for every type except DOMAIN_REGISTRATION. */
  planId?: string;
  billingPeriod?: "MONTHLY" | "YEARLY";
  durationMonths?: number;
  returnBaseUrl?: string;
  /** FQDN to register — DOMAIN_REGISTRATION only. */
  domain?: string;
  /** Defaults to the server's configured gateway when omitted. */
  provider?: PlatformPaymentProvider;
};

export const platformPaymentAPI = {
  /** The gateways this merchant may pay the platform with. */
  listStoreProviders: async (): Promise<BillingProvider[]> => {
    const { data } = await axiosInstance.get<{ data: BillingProvider[] }>(
      "/platform-payments/store/providers",
    );
    return data?.data ?? [];
  },

  initStore: async (payload: PlatformPaymentInitPayload): Promise<any> => {
    const { data } = await axiosInstance.post<any>(
      "/platform-payments/store/init",
      payload,
    );
    return data;
  },

  getStoreStatus: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      `/platform-payments/store/${id}`,
    );
    return data;
  },
};
