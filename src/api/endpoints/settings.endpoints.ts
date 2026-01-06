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
    const { data } = await axiosInstance.patch<any>(
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
};
