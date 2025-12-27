import axiosInstance from "@/utils/AxiosInstance";

export const variantAPI = {
  /**
   * Get all product variants with optional filtering by product ID
   */
  fetchAll: async (params?: { productId?: string }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/product/variant", {
      params: {
        ...(params?.productId && { productId: params.productId }),
      },
    });
    return data;
  },

  /**
   * Get a single product variant by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/product/variant/${id}`);
    return data;
  },

  /**
   * Create a new product variant
   */
  create: async (variant: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/product/variant", variant);
    return data;
  },

  /**
   * Update an existing product variant
   */
  update: async (id: string, variant: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(`/product/variant/${id}`, variant);
    return data;
  },

  /**
   * Delete a product variant (soft delete)
   */
  delete: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(`/product/variant/${id}`);
    return data;
  },
};

