import axiosInstance from "@/utils/AxiosInstance";

export const settingsAPI = {
  /**
   * Get all store settings
   */
  fetchAll: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/settings");
    return data;
  },

  /**
   * Get settings for a specific store
   */
  fetchByStoreId: async (storeId: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/settings/store/${storeId}`);
    return data;
  },

  /**
   * Get a single settings by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/settings/${id}`);
    return data;
  },

  /**
   * Create settings for a store
   */
  create: async (settings: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/settings", settings);
    return data;
  },

  /**
   * Update settings for a store (creates if not exists - upsert)
   */
  updateByStoreId: async (storeId: string, settings: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/settings/store/${storeId}`,
      settings
    );
    return data;
  },

  /**
   * Update settings by ID
   */
  update: async (id: string, settings: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(`/settings/${id}`, settings);
    return data;
  },

  /**
   * Delete settings for a store
   */
  deleteByStoreId: async (storeId: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/settings/store/${storeId}`
    );
    return data;
  },

  /**
   * Delete settings by ID
   */
  delete: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(`/settings/${id}`);
    return data;
  },

  /**
   * Update store delivery company
   */
  updateDeliveryCompany: async (deliveryCompanyId: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      "/settings/delivery-company",
      { deliveryCompanyId }
    );
    return data;
  },

  /**
   * Update store payment methods
   */
  updatePaymentMethods: async (paymentMethods: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      "/settings/payment-methods",
      paymentMethods
    );
    return data;
  },

  /**
   * Update store details
   */
  updateStoreDetails: async (storeDetails: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      "/settings/details",
      storeDetails
    );
    return data;
  },

  /**
   * Update store general settings
   */
  updateGeneralSettings: async (generalSettings: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      "/settings/general-settings",
      generalSettings
    );
    return data;
  },

  /**
   * Get settings for the current store user
   */
  fetchCurrent: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/settings/current");
    return data;
  },

  /**
   * Update settings for the current store user (creates if not exists - upsert)
   */
  updateCurrent: async (settings: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      "/settings/current",
      settings
    );
    return data;
  },

  /**
   * Update store logo
   */
  updateStoreLogo: async (logo: File): Promise<any> => {
    const formData = new FormData();
    formData.append("logo", logo);
    const { data } = await axiosInstance.put<any>("/settings/logo", formData);
    return data;
  },

  /**
   * Delete store logo
   */
  deleteStoreLogo: async (): Promise<any> => {
    const { data } = await axiosInstance.delete<any>("/settings/logo");
    return data;
  },
};
