import axiosInstance from "@/utils/AxiosInstance";

export const statsAPI = {
  /**
   * Get store statistics (orders, categories, products, discounts, customers)
   */
  getStoreStats: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/stats/store");
    return data;
  },

  /**
   * Get monthly sales data (month name, sales count, orders count)
   */
  getMonthlySales: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/stats/monthly-sales");
    return data;
  },

  /**
   * Get order statistics grouped by status (status type and count)
   */
  getOrdersStatusStats: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/stats/orders-status");
    return data;
  },

  /**
   * Get list of most bought products (product name and purchase count)
   */
  getMostBoughtProducts: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/stats/most-bought-products");
    return data;
  },

  /**
   * Get combined stats (monthly-sales, orders-status, most-bought-products)
   * filtered by period or custom from/to date range.
   */
  getCombinedStats: async (params?: {
    period?: string;
    from?: string;
    to?: string;
  }): Promise<{
    monthlySales: any[];
    ordersStatusStats: any[];
    mostBoughtProducts: any[];
  }> => {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.set("period", params.period);
    if (params?.from) searchParams.set("from", params.from);
    if (params?.to) searchParams.set("to", params.to);
    const query = searchParams.toString();
    const url = `/stats/combined${query ? `?${query}` : ""}`;
    const { data } = await axiosInstance.get<any>(url);
    return data;
  },
};

