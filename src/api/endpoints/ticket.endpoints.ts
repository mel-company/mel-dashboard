import axiosInstance from "@/utils/AxiosInstance";
import { appendTicketFiles } from "@/api/utils/ticket-files";
import type {
  CreateStoreSupportTicketInput,
  CreateStoreSupportTicketResult,
  CursorPage,
  SendTicketMessageInput,
  SupportTicketDetail,
  SupportTicketListItem,
  TicketMessage,
} from "@/api/types/ticket";

/** @deprecated use CreateStoreSupportTicketInput */
export type CreateStoreSupportTicketDto = CreateStoreSupportTicketInput;

export type CreateSupportTicketDto = CreateStoreSupportTicketInput & {
  priority?: string;
  assignedToId?: string;
  storeId?: string;
};

export type AssignTicketDto = {
  assignedToId: string;
};

export type ResolveTicketDto = {
  resolvedNote: string;
};

function buildCreateTicketFormData(
  fields: Omit<CreateStoreSupportTicketInput, "files">,
  files: File[],
): FormData {
  const formData = new FormData();
  formData.append("title", fields.title);
  formData.append("description", fields.description);
  if (fields.type) formData.append("type", fields.type);
  if (fields.department) formData.append("department", fields.department);
  appendTicketFiles(formData, files);
  return formData;
}

function isAxiosStatus(err: unknown, status: number): boolean {
  return (err as { response?: { status?: number } })?.response?.status === status;
}

export const ticketAPI = {
  // ─── Store user endpoints ─────────────────────────────────────────────────

  /**
   * Create a support ticket (store user).
   * With files: tries multipart create first, then JSON + separate upload.
   * If the attachment route is missing (404), the ticket is still returned.
   */
  createStore: async (
    body: CreateStoreSupportTicketInput,
  ): Promise<CreateStoreSupportTicketResult> => {
    const { files, ...fields } = body;

    if (files?.length) {
      try {
        const { data } = await axiosInstance.post<SupportTicketDetail>(
          "/support-ticket/store",
          buildCreateTicketFormData(fields, files),
        );
        return data;
      } catch (err) {
        if (!isAxiosStatus(err, 400)) throw err;
      }
    }

    const { data } = await axiosInstance.post<SupportTicketDetail>(
      "/support-ticket/store",
      fields,
    );

    if (!files?.length) {
      return data;
    }

    try {
      const formData = new FormData();
      appendTicketFiles(formData, files);

      const { data: withAttachments } = await axiosInstance.post<SupportTicketDetail>(
        `/support-ticket/store/${data.id}/attachments`,
        formData,
      );
      return withAttachments;
    } catch {
      return { ...data, attachmentsFailed: true };
    }
  },

  /** Add attachments to an existing ticket */
  addStoreAttachments: async (
    ticketId: string,
    files: File[],
  ): Promise<SupportTicketDetail> => {
    const formData = new FormData();
    appendTicketFiles(formData, files);

    const { data } = await axiosInstance.post<SupportTicketDetail>(
      `/support-ticket/store/${ticketId}/attachments`,
      formData,
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

  /** Filter support tickets with cursor pagination (infinite scroll) */
  fetchFilterStoreCursor: async (params?: {
    query?: string;
    type?: string;
    status?: string;
    department?: string;
    cursor?: string | null;
    limit?: number;
  }): Promise<CursorPage<SupportTicketListItem>> => {
    const { data } = await axiosInstance.get<
      CursorPage<SupportTicketListItem>
    >("/support-ticket/store/filter-cursor",
      {
        params: {
          ...(params?.query && { query: params.query }),
          ...(params?.type && { type: params.type }),
          ...(params?.status && { status: params.status }),
          ...(params?.department && { department: params.department }),
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit != null && { limit: params.limit }),
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

  /** Send a reply message on a ticket. Uses multipart when files are included. */
  sendMessageStore: async (
    body: SendTicketMessageInput,
  ): Promise<TicketMessage> => {
    const { files, ticketId, message } = body;

    if (files?.length) {
      const formData = new FormData();
      formData.append("ticketId", String(ticketId));
      if (message?.trim()) formData.append("message", message.trim());
      appendTicketFiles(formData, files);

      const { data } = await axiosInstance.post<TicketMessage>(
        "/message/send",
        formData,
      );
      return data;
    }

    const { data } = await axiosInstance.post<TicketMessage>("/message/send", {
      ticketId,
      message: message ?? "",
    });
    return data;
  },

  /** Get all messages for a ticket (store user) */
  fetchMessagesStore: async (ticketId: string): Promise<TicketMessage[]> => {
    const { data } = await axiosInstance.get<TicketMessage[]>(
      `/message/store/${ticketId}/messages`,
    );
    return data;
  },

  /** Get messages for a ticket with cursor pagination */
  fetchMessagesStoreCursor: async (
    ticketId: string,
    params?: { cursor?: string | null; limit?: number },
  ): Promise<CursorPage<TicketMessage>> => {
    const { data } = await axiosInstance.get<CursorPage<TicketMessage>>(
      `/message/store/${ticketId}/messages/cursor`,
      {
        params: {
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit != null && { limit: params.limit }),
        },
      },
    );
    return data;
  },

  /** Delete a message */
  deleteMessage: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/message/${id}`);
  },
};
