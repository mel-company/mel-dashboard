import axiosInstance from "@/utils/AxiosInstance";

export const deliveryCompanyAPI = {
  /**
   * Get all delivery companies
   */
  fetchAll: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/delivery-company");
    return data;
  },

  /**
   * Get a single delivery company by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/delivery-company/${id}`);
    return data;
  },

  /**
   * Create a new delivery company
   */
  create: async (deliveryCompany: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>(
      "/delivery-company",
      deliveryCompany
    );
    return data;
  },

  /**
   * Update an existing delivery company
   */
  update: async (id: string, deliveryCompany: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/delivery-company/${id}`,
      deliveryCompany
    );
    return data;
  },

  /**
   * Delete a delivery company (soft delete)
   */
  delete: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(`/delivery-company/${id}`);
    return data;
  },
};
