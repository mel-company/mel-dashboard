import axiosInstance from "@/utils/AxiosInstance";
import type {
  CalculatePrimeChargesInput,
  CreatePrimeMerchantInput,
  CreatePrimeShipmentInput,
  CreatePrimeShopInput,
} from "@/api/types/prime";

export const primeAPI = {
  login: async (): Promise<unknown> => {
    const { data } = await axiosInstance.post("/prime/auth/login");
    return data;
  },

  getStates: async (): Promise<unknown> => {
    const { data } = await axiosInstance.get("/prime/states");
    return data;
  },

  getDistricts: async (stateCode: string): Promise<unknown> => {
    const { data } = await axiosInstance.get(
      `/prime/states/${stateCode}/districts`,
    );
    return data;
  },

  getBranches: async (): Promise<unknown> => {
    const { data } = await axiosInstance.get("/prime/branches");
    return data;
  },

  syncLookups: async (): Promise<unknown> => {
    const { data } = await axiosInstance.post("/prime/lookups/sync");
    return data;
  },

  getSystemSteps: async (): Promise<unknown> => {
    const { data } = await axiosInstance.get("/prime/system-steps");
    return data;
  },

  getReturnReasons: async (): Promise<unknown> => {
    const { data } = await axiosInstance.get("/prime/return-reasons");
    return data;
  },

  createMerchant: async (body: CreatePrimeMerchantInput): Promise<unknown> => {
    const payload: Record<string, unknown> = { ...body };
    if (!payload.email || typeof payload.email !== "string" || !payload.email.trim()) {
      delete payload.email;
    }
    if (!payload.loginId) {
      delete payload.loginId;
    }
    const { data } = await axiosInstance.post("/prime/merchants", payload);
    return data;
  },

  getMerchants: async (): Promise<unknown> => {
    const { data } = await axiosInstance.get("/prime/merchants");
    return data;
  },

  updateMerchant: async (
    merchantLoginId: string,
    body: Partial<CreatePrimeMerchantInput>,
  ): Promise<unknown> => {
    const { data } = await axiosInstance.put(
      `/prime/merchants/${merchantLoginId}`,
      body,
    );
    return data;
  },

  getMerchantShops: async (merchantLoginId: string): Promise<unknown> => {
    const { data } = await axiosInstance.get(
      `/prime/merchants/${merchantLoginId}/shops`,
    );
    return data;
  },

  createShop: async (
    merchantLoginId: string,
    body: CreatePrimeShopInput,
  ): Promise<unknown> => {
    const { data } = await axiosInstance.post(
      `/prime/merchants/${merchantLoginId}/shops`,
      body,
    );
    return data;
  },

  calculateCharges: async (
    body: CalculatePrimeChargesInput,
  ): Promise<unknown> => {
    const { data } = await axiosInstance.post(
      "/prime/shipments/calculate-charges",
      body,
    );
    return data;
  },

  createShipment: async (body: CreatePrimeShipmentInput): Promise<unknown> => {
    const { data } = await axiosInstance.post("/prime/shipments", body);
    return data;
  },

  searchShipments: async (body: {
    fromDate: string;
    toDate: string;
  }): Promise<unknown> => {
    const { data } = await axiosInstance.post("/prime/shipments/search", body);
    return data;
  },

  getShipmentInfo: async (caseIds: number[]): Promise<unknown> => {
    const { data } = await axiosInstance.post("/prime/shipments/info", {
      caseIds,
    });
    return data;
  },

  getShipmentHistory: async (caseId: number): Promise<unknown> => {
    const { data } = await axiosInstance.get(
      `/prime/shipments/${caseId}/history`,
    );
    return data;
  },

  getOrderShipment: async (orderId: string): Promise<unknown> => {
    const { data } = await axiosInstance.get(
      `/prime/orders/${orderId}/shipment`,
    );
    return data;
  },

  syncOrderShipment: async (orderId: string): Promise<unknown> => {
    const { data } = await axiosInstance.post(
      `/prime/orders/${orderId}/shipment/sync`,
    );
    return data;
  },
};
