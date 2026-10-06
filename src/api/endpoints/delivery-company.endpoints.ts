import axiosInstance from "@/utils/AxiosInstance";
import type { DeliveryCompany } from "@/api/types/delivery-company";

/** The server caps `limit` at 100 and the picker has to offer all of them. */
const ALL_COMPANIES = 100;

export const deliveryCompanyAPI = {
  /**
   * شركات التوصيل المتاحة.
   *
   * The route is **paginated** — it answers `{ data, total, page, limit }` —
   * so the list is unwrapped here and nothing above has to know. A caller
   * that took the envelope for the array threw `find is not a function` the
   * moment the answer arrived, which is exactly what the courier picker in
   * settings did; `?? []` does not catch it, because an envelope is not null.
   *
   * It also asks for every company rather than the default first page of ten:
   * a merchant may change courier once every 30 days, so a company missing
   * from this list is one they cannot choose for a month.
   *
   * **Active only, and the server decides that now.** The route used to answer
   * with the withdrawn companies too and took `status` as a hint, while
   * `updateDeliveryCompany` accepted any company that was not soft-deleted —
   * so an inactive company could be chosen here and then held for 30 days by
   * the change limit, with nothing in the list saying it was never going to
   * carry a parcel. The write path refuses a non-active company and this
   * listing no longer returns one, so the filter is not a client-side
   * courtesy any more.
   */
  fetchAll: async (): Promise<DeliveryCompany[]> => {
    const { data } = await axiosInstance.get<
      { data?: DeliveryCompany[] } | DeliveryCompany[]
    >("/delivery-company", {
      params: { limit: ALL_COMPANIES },
    });

    if (Array.isArray(data)) return data;
    return data?.data ?? [];
  },

  /**
   * Get a single delivery company by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/delivery-company/${id}`);
    return data;
  },

  /**
   * Create a new delivery company
   */
  create: async (deliveryCompany: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>(
      "/delivery-company",
      deliveryCompany
    );
    return data;
  },

  /**
   * Update an existing delivery company
   */
  update: async (id: string, deliveryCompany: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/delivery-company/${id}`,
      deliveryCompany
    );
    return data;
  },

  /**
   * Delete a delivery company (soft delete)
   */
  delete: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(`/delivery-company/${id}`);
    return data;
  },
};
