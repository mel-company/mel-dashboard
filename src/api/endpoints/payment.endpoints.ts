import axiosInstance from "@/utils/AxiosInstance";

export const paymentAPI = {
  /**
   * Get all payments provider
  */
  fetchAll: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/payment-provider");
    return data;
  },
}