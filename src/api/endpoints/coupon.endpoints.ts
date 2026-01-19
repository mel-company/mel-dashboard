
import axiosInstance from "@/utils/AxiosInstance";

export const couponAPI = {
  /**
   * Get all coupons with optional filtering and pagination
   */
  fetchAll: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/coupon", {
      params: {
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },



  /**
   * Get a single country by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/coupon/${id}`);
    return data;
  },

  /**
   * Get all products with optional filtering and pagination
   */
  search: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/coupon/search",
      {
        params: {
          ...(params?.query && { query: params.query }),
          ...(params?.storeId && { storeId: params.storeId }),
          ...(params?.page && { page: params.page }),
          ...(params?.limit && { limit: params.limit }),
        },
      }
    );
    return data;
  },

  /**
   * Create a new product
   */
  create: async (coupon: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/coupon", coupon);
    return data;
  },

  /**
   * Add products to a coupon
   */
  addProducts: async (id: string, productIds: string[]): Promise<any> => {
    const { data } = await axiosInstance.post<any>(`/coupon/${id}/products`, {
      productIds,
    });
    return data;
  },

  /**
   * Remove Coupon
   */
  remove: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/coupon/${id}`
    );
    return data;
  },

  /**
   * Remove a product from a coupon
   */
  removeProducts: async (id: string, productId: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/coupon/${id}/products/${productId}`
    );
    return data;
  },

  /**
   * Add categories to a coupon
   */
  addCategories: async (id: string, categoryIds: string[]): Promise<any> => {
    const { data } = await axiosInstance.post<any>(`/coupon/${id}/categories`, {
      categoryIds,
    });
    return data;
  },

  /**
   * Remove a category from a coupon
   */
  removeCategories: async (id: string, categoryId: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/coupon/${id}/categories/${categoryId}`
    );
    return data;
  },

  /**
   * Check if a coupon code is available
   */
  checkCodeAvailability: async (params?: {
    code: string;
    excludeCouponId?: string;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/coupon/check-code-availability",
      {
        params: {
          ...(params?.code && { code: params.code }),
          ...(params?.excludeCouponId && { excludeCouponId: params.excludeCouponId }),
        },
      }
    );
    return data;
  },
};

