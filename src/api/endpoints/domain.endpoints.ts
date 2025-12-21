import axiosInstance from "@/utils/AxiosInstance";

export const domainAPI = {
  /**
   * Find domain details
   */
  findDomainDetails: async (): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/domain/domain-details");
    return data;
  },
}