import axiosInstance from "@/utils/AxiosInstance";

export type AccessRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AccessRequest = {
  id: string;
  storeId: string;
  moduleName: string;
  message: string | null;
  status: AccessRequestStatus;
  createdAt: string;
  decidedAt: string | null;
  decisionNote: string | null;
  requester: {
    id: string;
    user: { name: string | null; phone: string | null; email: string | null };
    role: { name: string; technical_name: string };
  };
  decidedBy?: {
    id: string;
    user: { name: string | null };
  } | null;
};

export const accessRequestAPI = {
  listForStore: async (): Promise<AccessRequest[]> => {
    const { data } = await axiosInstance.get<AccessRequest[]>(
      "/employee/access-requests",
    );
    return data;
  },

  listMine: async (): Promise<AccessRequest[]> => {
    const { data } = await axiosInstance.get<AccessRequest[]>(
      "/employee/access-requests/mine",
    );
    return data;
  },

  create: async (body: {
    moduleName: string;
    message?: string;
  }): Promise<AccessRequest> => {
    const { data } = await axiosInstance.post<AccessRequest>(
      "/employee/access-requests",
      body,
    );
    return data;
  },

  approve: async (
    id: string,
    note?: string,
  ): Promise<AccessRequest> => {
    const { data } = await axiosInstance.post<AccessRequest>(
      `/employee/access-requests/${id}/approve`,
      note ? { note } : {},
    );
    return data;
  },

  reject: async (id: string, note?: string): Promise<AccessRequest> => {
    const { data } = await axiosInstance.post<AccessRequest>(
      `/employee/access-requests/${id}/reject`,
      note ? { note } : {},
    );
    return data;
  },
};
