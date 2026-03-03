import axiosInstance from "@/utils/AxiosInstance";

export const templateAPI = {
  getTemplates: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/template");
    return data;
  },

  /**
   * Search templates with cursor pagination (infinite scroll).
   * Search by name or description. Query is optional - when empty, returns all templates.
   */
  searchCursor: async (params?: {
    query?: string | null;
    cursor?: string | null;
    limit?: number;
  }): Promise<{ data: any[]; nextCursor: string | null }> => {
    const { data } = await axiosInstance.get<any>("/template/search-cursor", {
      params: {
        ...(params?.query != null &&
          params.query !== "" && { query: params.query }),
        ...(params?.cursor && { cursor: params.cursor }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },
};
