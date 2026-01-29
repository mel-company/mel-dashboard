import axiosInstance from "@/utils/AxiosInstance";
import type { ProductListResponse } from "../types/product";

export const productAPI = {
  /**
   * Get all products with cursor pagination (GET /product/cursor?cursor=&limit=)
   */
  fetchAllCursor: async (params?: {
    cursor?: string | null;
    limit?: number;
    storeId?: string;
    categoryId?: string;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/product/cursor",
      {
        params: {
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit && { limit: params.limit }),
        },
      },
    );

    return data;
  },

  /**
   * Get all products by store domain with optional filtering and pagination
   */
  fetchAllByStoreDomain: async (domain: string, params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/product/by-store-domain", {
      params: {
        store: domain,
        ...(params?.categoryId && { categoryId: params.categoryId }),
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Search products (page-based, legacy)
   */
  search: async (params?: any): Promise<ProductListResponse> => {
    const { data } = await axiosInstance.get<ProductListResponse>(
      "/product/search",
      {
        params: {
          ...(params?.query && { query: params.query }),
          ...(params?.storeId && { storeId: params.storeId }),
          ...(params?.categoryId && { categoryId: params.categoryId }),
          ...(params?.page && { page: params.page }),
          ...(params?.limit && { limit: params.limit }),
        },
      }
    );
    return data;
  },

  /**
   * Search products with cursor pagination (infinite scroll)
   * GET /product/search-cursor?query=&cursor=&limit=20
   */
  fetchSearchCursor: async (params: {
    query: string;
    cursor?: string | null;
    limit?: number;
    categoryId?: string;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/product/search-cursor",
      {
        params: {
          query: params.query,
          ...(params.cursor && { cursor: params.cursor }),
          ...(params.limit && { limit: params.limit }),
          ...(params.categoryId && { categoryId: params.categoryId }),
        },
      }
    );
    return data;
  },

  /**
   * Get a single product by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/product/${id}`);
    return data;
  },

  /**
   * Create a new product
   */
  create: async (product: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/product", product);
    return data;
  },

  /**
   * Add categories to a product
   */
  addCategory: async (id: string, categoryIds: string[]): Promise<any> => {
    const { data } = await axiosInstance.post<any>(`/product/${id}/category`, {
      categoryIds,
    });
    return data;
  },

  /**
   * Remove a category from a product
   */
  removeCategory: async (id: string, categoryId: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/product/${id}/category/${categoryId}`
    );
    return data;
  },

  /**
   * Create a new product option
   */
  createProductOption: async (option: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/product/option", option);
    return data;
  },

  /**
   * Get a single product option by ID
   */
  fetchOneProductOption: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/product/option/${id}`);
    return data;
  },

  /**
   * Update a product option
   */
  updateProductOption: async (id: string, option: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/product/option/${id}`,
      option
    );
    return data;
  },

  /**
   * Delete a product option (soft delete)
   */
  deleteProductOption: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(`/product/option/${id}`);
    return data;
  },

  /**
   * Update a product option value
   */
  updateProductOptionValue: async (id: string, value: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/product/option-value/${id}`,
      value
    );
    return data;
  },

  /**
   * Delete a product option value (soft delete)
   */
  deleteProductOptionValue: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/product/option-value/${id}`
    );
    return data;
  },

  /**
   * Update an existing product
   * Accepts FormData for multipart/form-data uploads (with optional image file)
   */
  update: async (id: string, product: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(`/product/${id}`, product);
    return data;
  },

  /**
   * Delete a product (soft delete)
   */
  delete: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(`/product/${id}`);
    return data;
  },

  /**
   * Seed dummy products
   */
  seedDummyProducts: async (): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/product/dummy");
    return data;
  },

  /**
   * Find variant by product ID and selected options
   */
  findVariantByOptions: async (
    productId: string,
    selectedOptions: Record<string, string>
  ): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/variant/find-by-options", {
      productId,
      selectedOptions,
    });
    return data;
  },

  /**
   * Update product image
   */
  updateProductImage: async (productId: string, image: File): Promise<any> => {
    const formData = new FormData();
    formData.append("image", image);
    const { data } = await axiosInstance.put<any>(
      `/product/${productId}/image`,
      formData
    );
    return data;
  },

  /**
   * Delete product image
   */
  deleteProductImage: async (productId: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/product/${productId}/image`
    );
    return data;
  },
};
