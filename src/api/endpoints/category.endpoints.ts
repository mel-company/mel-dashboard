import axiosInstance from "@/utils/AxiosInstance";
import { uploadEntityImage } from "@/api/utils/entity-image-upload";

function categoryFormDataToJson(formData: FormData): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  const name = formData.get("name");
  if (typeof name === "string") body.name = name;

  const description = formData.get("description");
  if (typeof description === "string") body.description = description;

  const enabled = formData.get("enabled");
  if (enabled != null && enabled !== "") {
    body.enabled = String(enabled) === "true";
  }

  const tempImageUrl = formData.get("tempImageUrl");
  if (typeof tempImageUrl === "string" && tempImageUrl.trim()) {
    body.image = tempImageUrl.trim();
  }

  return body;
}

export const categoryAPI = {
  /**
   * Get all categories with optional filtering and pagination
   */
  fetchAll: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/category", {
      params: {
        ...(params?.storeId && { storeId: params.storeId }),
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  fetchAllCursor: async (params?: {
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/category/cursor", {
      params: {
        ...(params?.cursor && { cursor: params.cursor }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  fetchSearchCursor: async (params?: {
    query: string;
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/category/search-cursor", {
      params: {
        query: params?.query,
        ...(params?.cursor && { cursor: params.cursor }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Filter and/or search categories with cursor pagination.
   * Supports: groupIds, hasDiscount, enabled. When filters are applied, search runs within filtered data.
   */
  fetchFilterCursor: async (params?: {
    query?: string | null;
    groupIds?: string[];
    hasDiscount?: boolean;
    enabled?: boolean;
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/category/filter-cursor",
      {
        params: {
          ...(params?.query != null &&
            params.query !== "" && { query: params.query }),
          ...(params?.groupIds &&
            params.groupIds.length > 0 && { groupIds: params.groupIds }),
          ...(params?.hasDiscount !== undefined && {
            hasDiscount: params.hasDiscount,
          }),
          ...(params?.enabled !== undefined && { enabled: params.enabled }),
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit && { limit: params.limit }),
        },
      }
    );
    return data;
  },

  /**
   * Get all categories by store domain with optional filtering and pagination
   */
  fetchAllByStoreDomain: async (domain: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/category/by-store-domain", {
      params: {
        store: domain,
      },
    });
    return data;
  },

  /**
   * Search for categories with optional filtering and pagination
   */
  search: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/category/search", {
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
   * Get a single category by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/category/${id}`);
    return data;
  },

  /**
   * Create a new category.
   * With file: try multipart create, fallback JSON + PUT /:id/image.
   */
  create: async (formData: FormData): Promise<any> => {
    const imageFile = formData.get("image");
    const jsonBody = categoryFormDataToJson(formData);

    if (imageFile instanceof File) {
      const multipart = new FormData();
      for (const [key, value] of Object.entries(jsonBody)) {
        if (key === "image") continue; // file field wins over temp logo URL
        if (value === undefined || value === null) continue;
        multipart.append(key, String(value));
      }
      multipart.append("image", imageFile);

      try {
        const { data } = await axiosInstance.post<any>("/category", multipart, {
          timeout: 60_000,
        });
        return data;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status !== 400 && status !== 415) throw err;
      }

      const { data: created } = await axiosInstance.post<any>(
        "/category",
        jsonBody,
      );
      return uploadEntityImage(`/category/${created.id}/image`, imageFile);
    }

    const { data } = await axiosInstance.post<any>("/category", jsonBody);
    return data;
  },

  /**
   * Update an existing category
   * Accepts FormData for multipart/form-data uploads (with optional image file)
   */
  update: async (
    id: string,
    category: FormData | Record<string, unknown>,
  ): Promise<any> => {
    if (category instanceof FormData) {
      const imageFile = category.get("image");
      const jsonBody = categoryFormDataToJson(category);

      if (imageFile instanceof File) {
        const multipart = new FormData();
        for (const [key, value] of Object.entries(jsonBody)) {
          if (key === "image") continue;
          if (value === undefined || value === null) continue;
          multipart.append(key, String(value));
        }
        multipart.append("image", imageFile);

        try {
          const { data } = await axiosInstance.put<any>(
            `/category/${id}`,
            multipart,
            { timeout: 60_000 },
          );
          return data;
        } catch (err: any) {
          const status = err?.response?.status;
          if (status !== 400 && status !== 415) throw err;
          await axiosInstance.put<any>(`/category/${id}`, jsonBody);
          return uploadEntityImage(`/category/${id}/image`, imageFile);
        }
      }

      const { data } = await axiosInstance.put<any>(`/category/${id}`, jsonBody);
      return data;
    }

    const { data } = await axiosInstance.put<any>(`/category/${id}`, category);
    return data;
  },

  /**
   * Delete a category (soft delete)
   */
  delete: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(`/category/${id}`);
    return data;
  },

  /**
   * Get available categories not related to a discount or product
   */
  fetchAvailable: async (params?: {
    discountId?: string;
    productId?: string;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/category/available", {
      params: {
        ...(params?.discountId && { discountId: params.discountId }),
        ...(params?.productId && { productId: params.productId }),
      },
    });
    return data;
  },

  /**
   * Get available categories not related to a discount or product (cursor pagination for infinite scroll)
   */
  fetchAvailableCategoriesCursor: async (params?: {
    discountId?: string;
    productId?: string;
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/category/available-cursor",
      {
        params: {
          ...(params?.discountId && { discountId: params.discountId }),
          ...(params?.productId && { productId: params.productId }),
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit && { limit: params.limit }),
        },
      }
    );
    return data;
  },

  /**
   * Search available categories not related to a discount or product (cursor pagination for infinite scroll)
   */
  fetchAvailableCategoriesSearchCursor: async (params?: {
    discountId?: string;
    productId?: string;
    query?: string | null;
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/category/available-search-cursor",
      {
        params: {
          ...(params?.discountId && { discountId: params.discountId }),
          ...(params?.productId && { productId: params.productId }),
          ...(params?.query != null &&
            params.query !== "" && { query: params.query }),
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit && { limit: params.limit }),
        },
      }
    );
    return data;
  },

  /**
   * Add products to a category
   */
  addProducts: async (id: string, productIds: string[]): Promise<any> => {
    const { data } = await axiosInstance.post<any>(`/category/${id}/product`, {
      productIds,
    });
    return data;
  },

  /**
   * Remove a product from a category
   */
  removeProduct: async (id: string, productId: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/category/${id}/product/${productId}`
    );
    return data;
  },

  /**
   * Get available products not related to a category
   */
  fetchAvailableProducts: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      `/category/${id}/product/available`
    );
    return data;
  },

  /**
   * Get available products not related to a category (cursor pagination for infinite scroll)
   */
  fetchAvailableProductsCursor: async (
    id: string,
    params?: { cursor?: string | null; limit?: number }
  ): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      `/category/${id}/product/available/cursor`,
      {
        params: {
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit && { limit: params.limit }),
        },
      }
    );
    return data;
  },

  /**
   * Search available products not related to a category (cursor pagination for infinite scroll)
   */
  fetchAvailableProductsSearchCursor: async (
    id: string,
    params?: {
      query?: string | null;
      cursor?: string | null;
      limit?: number;
    }
  ): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      `/category/${id}/product/available/search-cursor`,
      {
        params: {
          ...(params?.query != null && params.query !== "" && { query: params.query }),
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit && { limit: params.limit }),
        },
      }
    );
    return data;
  },

  /**
   * Toggle category enabled status
   */
  toggleEnabled: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/category/${id}/toggle-enabled`
    );
    return data;
  },

  /**
   * Update category image
   */
  updateCategoryImage: async (
    categoryId: string,
    image: File
  ): Promise<any> => {
    return uploadEntityImage(`/category/${categoryId}/image`, image);
  },

  /**
   * Delete category image
   */
  deleteCategoryImage: async (categoryId: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/category/${categoryId}/image`
    );
    return data;
  },
};
