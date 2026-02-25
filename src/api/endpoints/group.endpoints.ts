import axiosInstance from "@/utils/AxiosInstance";

export const groupAPI = {
  /**
   * Get all groups with optional pagination
   */
  fetchAll: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/category-group", {
      params: {
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Get all groups with cursor pagination (infinite scroll)
   */
  fetchAllCursor: async (params?: {
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/category-group/cursor", {
      params: {
        ...(params?.cursor && { cursor: params.cursor }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Search groups with cursor pagination (infinite scroll)
   */
  fetchSearchCursor: async (params?: {
    query: string;
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/category-group/search-cursor",
      {
        params: {
          query: params?.query,
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit && { limit: params.limit }),
        },
      }
    );
    return data;
  },

  /**
   * Get a single group by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/category-group/${id}`);
    return data;
  },

  /**
   * Create a new group
   * Accepts FormData for multipart/form-data uploads (with optional image file)
   */
  create: async (formData: FormData): Promise<any> => {
    const { data } = await axiosInstance.post<any>(
      "/category-group",
      formData
    );
    return data;
  },

  /**
   * Update an existing group
   * Accepts FormData for multipart/form-data uploads (with optional image file)
   */
  update: async (id: string, formData: FormData): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/category-group/${id}`,
      formData
    );
    return data;
  },

  /**
   * Delete a group (soft delete)
   */
  delete: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(`/category-group/${id}`);
    return data;
  },

  /**
   * Get available categories not related to a group (cursor pagination for infinite scroll)
   */
  fetchAvailableCategoriesCursor: async (
    groupId: string,
    params?: {
      cursor?: string | null;
      limit?: number;
      query?: string | null;
    }
  ): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      `/category-group/${groupId}/available-categories`,
      {
        params: {
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit && { limit: params.limit }),
          ...(params?.query != null &&
            params.query !== "" && { query: params.query }),
        },
      }
    );
    return data;
  },

  /**
   * Add categories to a group
   */
  addCategories: async (
    groupId: string,
    categoryIds: string[]
  ): Promise<any> => {
    const { data } = await axiosInstance.post<any>(
      `/category-group/${groupId}/categories`,
      { categoryIds }
    );
    return data;
  },

  /**
   * Remove a category from a group
   */
  removeCategory: async (
    groupId: string,
    categoryId: string
  ): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/category-group/${groupId}/categories/${categoryId}`
    );
    return data;
  },
};
