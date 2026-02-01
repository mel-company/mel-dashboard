import axiosInstance from "@/utils/AxiosInstance";

export const notificationAPI = {
  /**
   * Get all notifications with optional filtering and pagination
   */
  fetchAll: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/notification", {
      params: {
        ...(params?.storeId && { storeId: params.storeId }),
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Get all notifications with cursor pagination (infinite scroll)
   */
  fetchAllCursor: async (params?: {
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/notification/cursor", {
      params: {
        ...(params?.cursor && { cursor: params.cursor }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Search notifications with cursor pagination (infinite scroll)
   */
  fetchSearchCursor: async (params?: {
    query: string;
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/notification/search-cursor",
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
   * Search for notifications with optional filtering and pagination
   */
  search: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/notification/search", {
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
   * Get a single notification by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/notification/${id}`);
    return data;
  },

  /**
   * Create a new notification
   */
  create: async (notification: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>(
      "/notification",
      notification
    );
    return data;
  },

  /**
   * Update an existing notification
   */
  update: async (id: string, notification: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/notification/${id}`,
      notification
    );
    return data;
  },

  /**
   * Delete a notification (soft delete)
   */
  delete: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(`/notification/${id}`);
    return data;
  },

  /**
   * Toggle read status of a notification for the current user
   */
  updateReadStatus: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>(`/notification/${id}/read`);
    return data;
  },

  /**
   * Get sample of notifications (at most 5) for the current user
   */
  notificationSample: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/notification/sample");
    return data;
  },
};
