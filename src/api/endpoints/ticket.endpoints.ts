import axiosInstance from "@/utils/AxiosInstance";

/** Create ticket payload (system or store) */
export interface CreateSupportTicketDto {
  title: string;
  description: string;
  priority?: string;
  type?: string;
  department?: string;
  assignedToId?: string;
  storeId?: string;
}

/** Create ticket payload for store user only (no priority, assignedToId, storeId) */
export interface CreateStoreSupportTicketDto {
  title: string;
  description: string;
  type?: string;
  department?: string;
}

/** Assign ticket payload (system only) */
export interface AssignTicketDto {
  assignedToId: string;
}

/** Resolve ticket payload (system only) */
export interface ResolveTicketDto {
  resolvedNote: string;
}

export const ticketAPI = {
  // ─── Store user endpoints ─────────────────────────────────────────────────

  /** Create a support ticket (store user) */
  createStore: async (body: CreateStoreSupportTicketDto): Promise<any> => {
    const { data } = await axiosInstance.post<any>(
      "/support-ticket/store",
      body
    );
    return data;
  },

  /** Get all support tickets for the store (store user). Supports pagination via page & limit. */
  fetchAllStore: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/support-ticket/store", {
      params: {
        ...(params?.page != null && { page: params.page }),
        ...(params?.limit != null && { limit: params.limit }),
        ...(params?.status != null && { status: params.status }),
      },
    });
    return data;
  },

  /** Get all support tickets with cursor pagination (infinite scroll) */
  fetchAllStoreCursor: async (params?: {
    cursor?: string | null;
    limit?: number;
    status?: string;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/support-ticket/store/cursor",
      {
        params: {
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit != null && { limit: params.limit }),
          ...(params?.status != null && { status: params.status }),
        },
      }
    );
    return data;
  },

  /** Search support tickets with cursor pagination (infinite scroll) */
  searchStoreCursor: async (params?: {
    query: string;
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/support-ticket/store/search-cursor",
      {
        params: {
          query: params?.query,
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit != null && { limit: params.limit }),
        },
      }
    );
    return data;
  },

  /** Search support tickets (store user). Query is required; page & limit optional. */
  searchStore: async (params: {
    query: string;
    page?: number;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/support-ticket/store/search",
      {
        params: {
          query: params.query,
          ...(params?.page != null && { page: params.page }),
          ...(params?.limit != null && { limit: params.limit }),
        },
      }
    );
    return data;
  },

  /** Get one support ticket by id (store user) */
  fetchOneStore: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      `/support-ticket/store/${id}`
    );
    return data;
  },

  /** Cancel a support ticket (store user) */
  cancelStore: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/support-ticket/store/${id}/cancel`
    );
    return data;
  },

  /** Close a support ticket (store user) */
  closeStore: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/support-ticket/store/${id}/close`
    );
    return data;
  },

  /** Delete a support ticket (store user) */
  deleteStore: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/support-ticket/store/${id}`
    );
    return data;
  },

  /** Send a reply message on a ticket (store user). Body: { ticketId, message }. */
  sendMessageStore: async (body: {
    ticketId: string;
    message: string;
  }): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/message/send", body);
    return data;
  },

  /** Get messages for a ticket with cursor pagination (5 per page). */
  fetchMessagesStoreCursor: async (
    ticketId: string,
    params?: { cursor?: string | null; limit?: number }
  ): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      `/message/store/${ticketId}/messages/cursor`,
      {
        params: {
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit != null && { limit: params.limit }),
        },
      }
    );
    return data;
  },
};
