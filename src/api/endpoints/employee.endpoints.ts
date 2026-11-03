import axiosInstance from "@/utils/AxiosInstance";

export type EmployeeRoleTemplateKey = "DATA" | "ORDERS";

export type CreateEmployeePayload = {
  name: string;
  phone: string;
  email?: string;
  roleTemplate: EmployeeRoleTemplateKey;
};

export type UpdateEmployeePayload = {
  roleTemplate?: EmployeeRoleTemplateKey;
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

  create: async (employee: CreateEmployeePayload): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/employee", employee);
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
