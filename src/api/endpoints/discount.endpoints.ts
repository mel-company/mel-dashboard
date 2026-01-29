import axiosInstance from "@/utils/AxiosInstance";

export const discountAPI = {
  /**
   * Get all discounts with optional filtering and pagination
   */
  fetchAll: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/discount", {
      params: {
        ...(params?.storeId && { storeId: params.storeId }),
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Get all discounts with cursor pagination (infinite scroll)
   */
  fetchAllCursor: async (params?: {
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/discount/cursor", {
      params: {
        ...(params?.cursor && { cursor: params.cursor }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Search discounts with cursor pagination (infinite scroll)
   */
  fetchSearchCursor: async (params?: {
    query: string;
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/discount/search-cursor", {
      params: {
        query: params?.query,
        ...(params?.cursor && { cursor: params.cursor }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Search for discounts with optional filtering and pagination
   */
  search: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/discount/search", {
      params: {
        ...(params?.query && { query: params.query }),
        ...(params?.storeId && { storeId: params.storeId }),
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Get a single discount by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/discount/${id}`);
    return data;
  },

  /**
   * Create a new discount
   */
  create: async (discount: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/discount", discount);
    return data;
  },

  /**
   * Update an existing discount
   */
  update: async (id: string, discount: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(`/discount/${id}`, discount);
    return data;
  },

  /**
   * Delete a discount (soft delete)
   */
  delete: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(`/discount/${id}`);
    return data;
  },

  /**
   * Enable a discount
   */
  enable: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>(`/discount/${id}/enable`);
    return data;
  },

  /**
   * Disable a discount
   */
  disable: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>(`/discount/${id}/disable`);
    return data;
  },

  /**
   * Add products to a discount
   */
  addProducts: async (id: string, productIds: string[]): Promise<any> => {
    const { data } = await axiosInstance.put<any>(`/discount/${id}/products`, {
      productIds,
    });
    return data;
  },

  /**
   * Add categories to a discount
   */
  addCategories: async (id: string, categoryIds: string[]): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/discount/${id}/categories`,
      {
        categoryIds,
      }
    );
    return data;
  },

  /**
   * Remove a product from a discount
   */
  removeProduct: async (id: string, productId: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/discount/${id}/products/${productId}`
    );
    return data;
  },

  /**
   * Remove a category from a discount
   */
  removeCategory: async (id: string, categoryId: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/discount/${id}/categories/${categoryId}`
    );
    return data;
  },

  /**
   * Update discount image
   */
  updateDiscountImage: async (
    discountId: string,
    image: File
  ): Promise<any> => {
    const formData = new FormData();
    formData.append("image", image);
    const { data } = await axiosInstance.put<any>(
      `/discount/${discountId}/image`,
      formData
    );
    return data;
  },

  /**
   * Delete Discount image
   */
  deleteDiscountImage: async (discountId: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/discount/${discountId}/image`
    );
    return data;
  },
};
