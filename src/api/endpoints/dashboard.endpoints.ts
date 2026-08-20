import axiosInstance from "@/utils/AxiosInstance";
import type {
  DashboardHomeQuery,
  DashboardHomeResponse,
} from "@/api/types/dashboard";

export const dashboardAPI = {
  getHome: async (
    params?: DashboardHomeQuery,
  ): Promise<DashboardHomeResponse> => {
    const { data } = await axiosInstance.get<DashboardHomeResponse>(
      "/dashboard/home",
      {
        params: {
          ...(params?.storeId && { storeId: params.storeId }),
          ...(params?.from && { from: params.from }),
          ...(params?.to && { to: params.to }),
        },
      },
    );
    return data;
  },
};
