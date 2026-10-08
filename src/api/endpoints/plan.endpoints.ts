import axiosInstance from "@/utils/AxiosInstance";

export const planAPI = {
  /**
   * Get all plans with optional filtering and pagination
   */
  fetchAll: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/plan/store-plans", {
      params: {
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Get a single plan by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/plan/${id}`);
    return data;
  },

  /**
   * Whether this store may use the POS surface right now.
   *
   * `GET /plan/pos-access` exists for exactly this — its own Swagger summary
   * says "call on dash /pos mount" — and nothing called it, so the POS page
   * gated only on the «متجر فعلي» store setting and a GO merchant could open
   * it. Answers `{ allowed: true }` or throws a 403 carrying
   * `PLAN_UPGRADE_REQUIRED`.
   *
   * Asked of the server rather than derived from the plan columns here, because
   * the answer depends on whether the *term* is in force, which no client can
   * see.
   */
  posAccess: async (): Promise<{ allowed: boolean; feature?: string }> => {
    const { data } = await axiosInstance.get<{
      allowed: boolean;
      feature?: string;
    }>("/plan/pos-access");
    return data;
  },
}