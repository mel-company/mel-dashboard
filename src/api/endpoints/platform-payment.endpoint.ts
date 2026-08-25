import axiosInstance from "@/utils/AxiosInstance";

export type PlatformPaymentInitPayload = {
  type: "INITIAL_SUBSCRIPTION" | "RENEWAL" | "CHANGE_PLAN";
  planId: string;
  billingPeriod?: "MONTHLY" | "YEARLY";
  durationMonths?: number;
  returnBaseUrl?: string;
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
