import axiosInstance from "@/utils/AxiosInstance";

export type EmployeeRoleTemplateKey = "DATA" | "ORDERS" | "ADMIN";

export type InviteEmployeePayload = {
  name: string;
  email: string;
  roleTemplate: EmployeeRoleTemplateKey;
};

/** @deprecated Use InviteEmployeePayload — hire is email-invite only. */
export type CreateEmployeePayload = InviteEmployeePayload;

export type UpdateEmployeePayload = {
  roleTemplate?: EmployeeRoleTemplateKey;
};

export type EmployeeInvite = {
  id: string;
  email: string;
  name: string;
  roleTemplate: EmployeeRoleTemplateKey | string;
  roleName?: string;
  expiresAt: string;
  createdAt?: string;
  inviteUrl: string | null;
  status: "pending";
  emailed?: boolean;
};

export type EmployeeInvitePreview = {
  token: string;
  email: string;
  name: string;
  roleTemplate: string;
  roleName: string;
  expiresAt: string;
  store: {
    name: string | null;
    domain: string | null;
    logo: string | null;
  };
};

export const employeeAPI = {
  fetchAll: async (params?: {
    storeId?: string;
    page?: number;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/employee", {
      params: {
        ...(params?.storeId && { storeId: params.storeId }),
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  fetchCursor: async (params?: {
    cursor?: string;
    limit?: number;
    query?: string;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/employee/cursor", {
      params,
    });
    return data;
  },

  fetchStats: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/employee/stats");
    return data;
  },

  fetchRoleTemplates: async (): Promise<any[]> => {
    const { data } = await axiosInstance.get<any[]>("/employee/role-templates");
    return data;
  },

  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/employee/${id}`);
    return data;
  },

  create: async (employee: InviteEmployeePayload): Promise<EmployeeInvite> => {
    const { data } = await axiosInstance.post<EmployeeInvite>(
      "/employee/invites",
      employee,
    );
    return data;
  },

  invite: async (employee: InviteEmployeePayload): Promise<EmployeeInvite> => {
    const { data } = await axiosInstance.post<EmployeeInvite>(
      "/employee/invites",
      employee,
    );
    return data;
  },

  fetchInvites: async (): Promise<EmployeeInvite[]> => {
    const { data } = await axiosInstance.get<EmployeeInvite[]>(
      "/employee/invites",
    );
    return data;
  },

  resendInvite: async (id: string): Promise<EmployeeInvite> => {
    const { data } = await axiosInstance.post<EmployeeInvite>(
      `/employee/invites/${id}/resend`,
    );
    return data;
  },

  revokeInvite: async (id: string): Promise<{ ok: boolean; id: string }> => {
    const { data } = await axiosInstance.delete<{ ok: boolean; id: string }>(
      `/employee/invites/${id}`,
    );
    return data;
  },

  previewInvite: async (token: string): Promise<EmployeeInvitePreview> => {
    const { data } = await axiosInstance.get<EmployeeInvitePreview>(
      `/employee/invites/by-token/${encodeURIComponent(token)}`,
    );
    return data;
  },

  acceptInvite: async (body: { token: string }): Promise<any> => {
    const { data } = await axiosInstance.post<any>(
      "/employee/invites/accept",
      body,
    );
    return data;
  },

  createJoinRequest: async (body: {
    name: string;
    email: string;
    message?: string;
    storeDomain?: string;
  }): Promise<{
    ok: boolean;
    message: string;
    alreadyMember?: boolean;
    emailed?: boolean;
  }> => {
    const { data } = await axiosInstance.post<{
      ok: boolean;
      message: string;
      alreadyMember?: boolean;
      emailed?: boolean;
    }>("/employee/join-requests", body);
    return data;
  },

  fetchJoinRequests: async (): Promise<any[]> => {
    const { data } = await axiosInstance.get<any[]>("/employee/join-requests");
    return data;
  },

  approveJoinRequest: async (
    id: string,
    body?: { roleTemplate?: EmployeeRoleTemplateKey; note?: string },
  ): Promise<any> => {
    const { data } = await axiosInstance.post(
      `/employee/join-requests/${id}/approve`,
      body ?? {},
    );
    return data;
  },

  rejectJoinRequest: async (id: string, note?: string): Promise<any> => {
    const { data } = await axiosInstance.post(
      `/employee/join-requests/${id}/reject`,
      note ? { note } : {},
    );
    return data;
  },

  update: async (id: string, employee: UpdateEmployeePayload): Promise<any> => {
    const { data } = await axiosInstance.put<any>(`/employee/${id}`, employee);
    return data;
  },

  delete: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(`/employee/${id}`);
    return data;
  },
};
