import axiosInstance from "@/utils/AxiosInstance";

export const countryAPI = {
  /**
   * Get all countries
   */
  fetchAll: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/country");
    return data;
  },

  /**
   * Get all countries with cursor pagination (infinite scroll)
   */
  fetchAllCursor: async (params?: {
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/country/cursor", {
      params: {
        ...(params?.cursor && { cursor: params.cursor }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Search countries with cursor pagination (infinite scroll)
   */
  searchCursor: async (params?: {
    query: string;
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/country/search-cursor", {
      params: {
        ...(params?.query && { query: params.query }),
        ...(params?.cursor && { cursor: params.cursor }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Get a single country by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/country/${id}`);
    return data;
  },
  /**
   * Fetch all countries phone codes
   */
  fetchPhoneCodes: async (order: "ar" | "en" = "ar"): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/country/phone-codes", {
      params: { order },
    });
    return data;
  },
};
