import axiosInstance from "@/utils/AxiosInstance";

/**
 * `create`, `update` and `delete` used to live here.
 *
 * All three pointed at routes that do not exist: the real ones are
 * `POST /subscription/system` and `PUT /subscription/system/:id`, and
 * `DELETE /subscription/:id` is operator-guarded. Nothing ever called them, so
 * three dead methods sat here looking like a merchant could create, edit or
 * delete a subscription. None of those is a merchant action: cancelling is, and
 * it has its own route below.
 */
export const subscriptionAPI = {
  /**
   * Get all subscriptions with optional filtering and pagination
   */
  fetchAll: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/subscription", {
      params: {
        ...(params?.storeId && { storeId: params.storeId }),
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Get a single subscription by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/subscription/${id}`);
    return data;
  },

  /**
   * Get a single store subscription
   */
  fetchStoreSubscription: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/subscription/store`);
    return data;
  },

      /**
   * Update an existing subscription
   */
  changePlan: async (planId: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/subscription/change-plan/${planId}`,
    );
    return data;
  },

    /**
   * Pause a subscription (set status to INACTIVE)
   */
  pause: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.patch<any>(
      `/subscription/${id}/pause`,
    );
    return data;
  },

  /**
   * Resume a subscription (set status to ACTIVE)
   */
  resume: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.patch<any>(
      `/subscription/${id}/resume`,
    );
    return data;
  },

  /**
   * Cancel a subscription (set status to CANCELLED)
   */
  cancel: async (): Promise<any> => {
    const { data } = await axiosInstance.put<any>(`/subscription/store/cancel`);
    return data;
  },

  /**
   * Renew a subscription (extend end date)
   */
  renew: async (id: string, durationMonths?: number): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/subscription/${id}/renew`,
      {
        ...(durationMonths && { durationMonths }),
      },
    );
    return data;
  },
};
