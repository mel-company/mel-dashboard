import axiosInstance from "@/utils/AxiosInstance";

/**
 * Collections — the merchant's own curated sets of products ("صيفي", "شتوي").
 *
 * Deliberately plainer than `category.endpoints.ts`. A collection is a name
 * and a list of products, with no image, so none of the multipart /
 * temp-url / upload-fallback machinery that file needs applies here: every
 * call below is ordinary JSON.
 *
 * `create` takes `productIds` because the endpoint accepts them in the same
 * request. The category and group dialogs have to create first and link in
 * `onSuccess`, which leaves a half-built entity behind a warning toast when
 * the second call fails.
 */
export const collectionAPI = {
  /**
   * Filter and/or search collections, cursor paginated.
   * This is the endpoint the dashboard list engine drives — see the
   * `apiEndpoint` on the `/collections` entry in `utils/pages`.
   */
  fetchFilterCursor: async (params?: {
    query?: string | null;
    enabled?: boolean;
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/collection/filter-cursor", {
      params: {
        ...(params?.query != null && params.query !== "" && { query: params.query }),
        ...(params?.enabled !== undefined && { enabled: params.enabled }),
        ...(params?.cursor && { cursor: params.cursor }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/collection/${id}`);
    return data;
  },

  create: async (body: {
    name: string;
    enabled?: boolean;
    productIds?: string[];
  }): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/collection", body);
    return data;
  },

  update: async (
    id: string,
    body: { name?: string; enabled?: boolean }
  ): Promise<any> => {
    const { data } = await axiosInstance.put<any>(`/collection/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(`/collection/${id}`);
    return data;
  },

  toggleEnabled: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/collection/${id}/toggle-enabled`
    );
    return data;
  },

  addProducts: async (id: string, productIds: string[]): Promise<any> => {
    const { data } = await axiosInstance.post<any>(`/collection/${id}/product`, {
      productIds,
    });
    return data;
  },

  removeProduct: async (id: string, productId: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/collection/${id}/product/${productId}`
    );
    return data;
  },

  /** Products not yet in the collection — the picker's list. */
  fetchAvailableProductsCursor: async (
    id: string,
    params?: { cursor?: string | null; limit?: number }
  ): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      `/collection/${id}/product/available/cursor`,
      {
        params: {
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit && { limit: params.limit }),
        },
      }
    );
    return data;
  },

  fetchAvailableProductsSearchCursor: async (
    id: string,
    params?: { query?: string | null; cursor?: string | null; limit?: number }
  ): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      `/collection/${id}/product/available/search-cursor`,
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
};

export default collectionAPI;
