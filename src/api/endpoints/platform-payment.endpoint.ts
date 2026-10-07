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

/**
 * What a subscription period actually costs this merchant right now.
 *
 * The promo ladder — one free month, then six at half price — is state only the
 * server can see, so a client that multiplies `plan.monthly_price` is right for
 * a merchant past the offer and wrong for every merchant inside it. The pay
 * button used to print 39,000 while the server took 19,500.
 */
export type SubscriptionQuote = {
  planId: string;
  planName: string;
  planCode: string | null;
  billingPeriod: "MONTHLY" | "YEARLY";
  durationMonths: number;
  currency: string;
  /** Due now. `0` means the intro month covers it and no gateway is involved. */
  amount: number;
  /** The same months with no promo applied. */
  listAmount: number;
  savings: number;
  breakdown: {
    freeMonths: number;
    discountMonths: number;
    fullMonths: number;
    monthlyPrice: number;
    discountedMonthlyPrice: number;
  };
  /** When this period runs out — i.e. when the next charge lands. */
  periodEndsAt: string;
  promo: {
    freeMonths: number;
    discountMonths: number;
    discountPercent: number;
  };
};

export type SubscriptionQuoteQuery = {
  type: "INITIAL_SUBSCRIPTION" | "RENEWAL" | "CHANGE_PLAN";
  planId: string;
  billingPeriod?: "MONTHLY" | "YEARLY";
  durationMonths?: number;
};

export const platformPaymentAPI = {
  /** Price a period without creating anything. */
  quoteStore: async (
    query: SubscriptionQuoteQuery,
  ): Promise<SubscriptionQuote> => {
    const { data } = await axiosInstance.get<SubscriptionQuote>(
      "/platform-payments/store/quote",
      { params: query },
    );
    return data;
  },

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
