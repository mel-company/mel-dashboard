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
};

