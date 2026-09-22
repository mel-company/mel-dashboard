import axiosInstance from "@/utils/AxiosInstance";

export type PlatformPaymentProvider = "QI_CARD" | "ZAIN_CASH";

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
