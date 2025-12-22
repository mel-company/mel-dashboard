import axiosInstance from "@/utils/AxiosInstance";

export const domainAPI = {
  /**
   * Find domain details
   */
  findDomainDetails: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/domain/domain-details");
    return data;
  },

  /**
   * Check domain availability
   */
  checkAvailability: async (domain: string): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/domain/check-availability", {
      domain,
    });
    return data;
  },

  /**
   * Update domain
   */
  updateDomain: async (domain: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>("/domain/update-domain", {
      domain,
    });
    return data;
  },
}