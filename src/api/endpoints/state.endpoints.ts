import axiosInstance from "@/utils/AxiosInstance";

export const stateAPI = {
  /**
   * Get all states with optional filtering by country
   */
  fetchAll: async (countryId?: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/state", {
      params: {
        ...(countryId && { countryId }),
      },
    });
    return data;
  },

  /**
   * Get a single state by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/state/${id}`);
    return data;
  },

  /**
   * Create a new state
   */
  create: async (state: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/state", state);
    return data;
  },

  /**
   * Update an existing state
   */
  update: async (id: string, state: any): Promise<any> => {
    const { data } = await axiosInstance.patch<any>(`/state/${id}`, state);
    return data;
  },

  /**
   * Delete a state
   */
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete<any>(`/state/${id}`);
  },
};

