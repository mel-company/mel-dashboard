import axiosInstance from "@/utils/AxiosInstance";

export const regionAPI = {
  /**
   * Get all regions with optional filtering by state
   */
  fetchAll: async (stateId?: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/region", {
      params: {
        ...(stateId && { stateId }),
      },
    });
    return data;
  },

  /**
   * Get all regions by state ID
   */
  fetchByState: async (stateId: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/region/state/${stateId}`);
    return data;
  },

  /**
   * Get a single region by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/region/${id}`);
    return data;
  },

  /**
   * Create a new region
   */
  create: async (region: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/region", region);
    return data;
  },

  /**
   * Update an existing region
   */
  update: async (id: string, region: any): Promise<any> => {
    const { data } = await axiosInstance.patch<any>(`/region/${id}`, region);
    return data;
  },

  /**
   * Delete a region
   */
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete<any>(`/region/${id}`);
  },
};

