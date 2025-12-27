import axiosInstance from "@/utils/AxiosInstance";

export const propertyAPI = {
  /**
   * Get all product properties with optional filtering by product ID
   */
  fetchAll: async (params?: { productId?: string }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/product/property", {
      params: {
        ...(params?.productId && { productId: params.productId }),
      },
    });
    return data;
  },

  /**
   * Get a single product property by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/product/property/${id}`);
    return data;
  },

  /**
   * Create a new product property
   */
  create: async (property: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/product/property", property);
    return data;
  },

  /**
   * Update an existing product property
   */
  update: async (id: string, property: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(`/product/property/${id}`, property);
    return data;
  },

  /**
   * Delete a product property
   */
  delete: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(`/product/property/${id}`);
    return data;
  },
};

