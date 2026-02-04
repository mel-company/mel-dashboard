import axiosInstance from "@/utils/AxiosInstance";

export const orderAPI = {
  /**
   * Get all orders with cursor pagination (infinite scroll)
   */
  fetchAllCursor: async (params?: {
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/order/cursor", {
      params: {
        ...(params?.cursor && { cursor: params.cursor }),
        ...(params?.limit != null && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Search orders with cursor pagination (infinite scroll)
   */
  fetchSearchCursor: async (params?: {
    query: string;
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/order/search-cursor", {
      params: {
        query: params?.query ?? "",
        ...(params?.cursor && { cursor: params.cursor }),
        ...(params?.limit != null && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Get all orders with optional filtering and pagination
   */
  fetchAll: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/order", {
      params: {
        ...(params?.storeId && { storeId: params.storeId }),
        ...(params?.customerId && { customerId: params.customerId }),
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Search for orders with optional filtering and pagination
   */
  search: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/order/search", {
      params: {
        ...(params?.query && { query: params.query }),
        ...(params?.storeId && { storeId: params.storeId }),
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Update delivery address of an order by ID
   */
  updateDeliveryAddress: async (
    id: string,
    deliveryAddress: any
  ): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/order/${id}/update-delivery-address`,
      deliveryAddress
    );
    return data;
  },

  /**
   * Get a single order by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/order/${id}/details`);
    return data;
  },

  /**
   * create order
   */
  createOrder: async (order: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>(
      "/order/create-order",
      order
    );
    return data;
  },

  /**
   * Checkout a new order
   */
  checkout: async (order: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/order/checkout", order);
    return data;
  },

  /**
   * Create a new order
   */
  create: async (order: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/order", order);
    return data;
  },

  /**
   * Update an existing order
   */
  update: async (id: string, order: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(`/order/${id}`, order);
    return data;
  },

  /**
   * Delete an order (soft delete)
   */
  delete: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(`/order/${id}`);
    return data;
  },

  /**
   * Update an order product
   */
  updateOrderProduct: async (
    orderId: string,
    productId: string,
    orderProduct: any
  ): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/order/${orderId}/product/${productId}`,
      orderProduct
    );
    return data;
  },

  /**
   * Add products to an existing order
   */
  addProductsToOrder: async (orderId: string, products: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>(
      `/order/${orderId}/products`,
      products
    );
    return data;
  },

  /**
   * Remove an order product from an order
   */
  removeOrderProduct: async (
    orderId: string,
    productId: string
  ): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/order/${orderId}/product/${productId}`
    );
    return data;
  },

  /**
   * Update order status to PENDING
   */
  updateStatusToPending: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/order/${id}/status/pending`
    );
    return data;
  },

  /**
   * Update order status to PROCESSING
   */
  updateStatusToProcessing: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/order/${id}/status/processing`
    );
    return data;
  },

  /**
   * Update order status to SHIPPED
   */
  updateStatusToShipped: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/order/${id}/status/shipped`
    );
    return data;
  },

  /**
   * Update order status to DELIVERED
   */
  updateStatusToDelivered: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/order/${id}/status/delivered`
    );
    return data;
  },

  /**
   * Update order status to CANCELLED
   */
  updateStatusToCancelled: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/order/${id}/status/cancelled`
    );
    return data;
  },

  /**
   * Get order logs by order ID
   */
  fetchOrderLogs: async (orderId: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      `/order-logs/order/${orderId}`
    );
    return data;
  },
};
