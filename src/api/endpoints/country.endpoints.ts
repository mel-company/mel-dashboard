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

