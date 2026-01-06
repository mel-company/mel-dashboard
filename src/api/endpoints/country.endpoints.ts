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
};

