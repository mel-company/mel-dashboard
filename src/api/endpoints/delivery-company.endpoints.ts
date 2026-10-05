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
   * **Active only.** The route answers with the withdrawn companies too, and
   * nothing on the ship path enforces the status — `updateDeliveryCompany`
   * accepts any company that is not soft-deleted. So an inactive company
   * offered here is one a merchant can choose and then be locked out of
   * changing for 30 days, with no way to tell from the list that it was
   * never going to carry a parcel.
   */
  fetchAll: async (): Promise<DeliveryCompany[]> => {
    const { data } = await axiosInstance.get<
      { data?: DeliveryCompany[] } | DeliveryCompany[]
    >("/delivery-company", {
      params: { limit: ALL_COMPANIES, status: "ACTIVE" },
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
