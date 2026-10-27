import axiosInstance from "@/utils/AxiosInstance";

type CreditTrial = { limit: number; used: number; remaining: number };

/**
 * The store owner's AI balance (`GET /credits/store/balance`). An unlimited
 * account carries only `remaining` (a sentinel), so branch on `unlimited`
 * rather than printing the number.
 */
export type StoreCreditBalance = {
  unlimited: boolean;
  has_ai_editor: boolean;
  periodStart?: string;
  periodEnd?: string;
  daily?: { limit: number; used: number; remaining: number };
  generations: {
    included?: number;
    used?: number;
    remaining: number;
    purchased?: number;
    trial?: CreditTrial;
  };
  editor: {
    included?: number;
    used?: number;
    remaining: number;
    purchased?: number;
    trial?: CreditTrial;
  };
};

export const creditsAPI = {
  storeBalance: async (): Promise<StoreCreditBalance> => {
    const { data } = await axiosInstance.get<StoreCreditBalance>(
      "/credits/store/balance",
    );
    return data;
  },
};
