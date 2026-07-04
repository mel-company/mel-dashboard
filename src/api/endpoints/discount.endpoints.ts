/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/AxiosInstance";

const DISCOUNT_CREATE_FIELDS = [
  "name",
  "description",
  "discount_percentage",
  "discount_start_date",
  "discount_end_date",
  "discount_status",
  "productIds",
  "categoryIds",
] as const;

function isAxiosStatus(err: unknown, status: number): boolean {
  return (err as { response?: { status?: number } })?.response?.status === status;
}

function sanitizeIdList(ids?: unknown[] | null): string[] {
  if (!Array.isArray(ids)) return [];
  return ids.filter(
    (id): id is string => typeof id === "string" && id.length > 0,
  );
}

function formDataToJsonBody(formData: FormData): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const key of DISCOUNT_CREATE_FIELDS) {
    const value = formData.get(key);
    if (value == null || value === "") continue;

    if (key === "discount_percentage") {
      const num = Number(value);
      if (Number.isFinite(num)) body[key] = num;
      continue;
    }

    if (key === "productIds" || key === "categoryIds") {
      try {
        body[key] = JSON.parse(String(value));
      } catch {
        body[key] = value;
      }
      continue;
    }

    body[key] = value;
  }
  const storeId = formData.get("storeId");
  if (typeof storeId === "string") body.storeId = storeId;
  return body;
}

export type CreateDiscountPayload = {
  storeId: string;
  name: string;
  description: string;
  discount_percentage: number;
  discount_start_date: string;
  discount_end_date: string;
  discount_status: string;
  image: string;
  imageFile?: File;
  productIds?: string[];
  categoryIds?: string[];
};

export const discountAPI = {
  /**
   * Get all discounts with optional filtering and pagination
   */
  fetchAll: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/discount", {
      params: {
        ...(params?.storeId && { storeId: params.storeId }),
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  fetchAvailableProducts: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      `/discount/${params?.discountId}/product/available`
    );
    return data;
  },

  /**
   * Get available products not related to a discount (cursor pagination for infinite scroll)
   */
  fetchAvailableProductsCursor: async (
    id: string,
    params?: { cursor?: string | null; limit?: number }
  ): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      `/discount/${id}/product/available-cursor`,
      {
        params: {
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit && { limit: params.limit }),
        },
      }
    );
    return data;
  },

  /**
   * Search available products not related to a discount (cursor pagination for infinite scroll)
   */
  fetchAvailableProductsSearchCursor: async (
    id: string,
    params?: {
      query?: string | null;
      cursor?: string | null;
      limit?: number;
    }
  ): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      `/discount/${id}/product/available-search-cursor`,
      {
        params: {
          ...(params?.query != null &&
            params.query !== "" && { query: params.query }),
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit && { limit: params.limit }),
        },
      }
    );
    return data;
  },

  fetchAvailableCategories: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/discount/available-categories",
      {
        params: {
          ...(params?.discountId && { discountId: params.discountId }),
          ...(params?.categoryId && { categoryId: params.categoryId }),
        },
      }
    );
    return data;
  },

  /**
   * Get all discounts with cursor pagination (infinite scroll)
   */
  fetchAllCursor: async (params?: {
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/discount/cursor", {
      params: {
        ...(params?.cursor && { cursor: params.cursor }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Search discounts with cursor pagination (infinite scroll)
   */
  fetchSearchCursor: async (params?: {
    query: string;
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/discount/search-cursor", {
      params: {
        query: params?.query,
        ...(params?.cursor && { cursor: params.cursor }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Filter and/or search discounts with cursor pagination.
   * Supports: status, startDate, endDate. When filters are applied, search runs within filtered data.
   */
  fetchFilterCursor: async (params?: {
    query?: string | null;
    status?: string;
    startDate?: string;
    endDate?: string;
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/discount/filter-cursor",
      {
        params: {
          ...(params?.query != null &&
            params.query !== "" && { query: params.query }),
          ...(params?.status && { status: params.status }),
          ...(params?.startDate && { startDate: params.startDate }),
          ...(params?.endDate && { endDate: params.endDate }),
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit && { limit: params.limit }),
        },
      }
    );
    return data;
  },

  /**
   * Search for discounts with optional filtering and pagination
   */
  search: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/discount/search", {
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
   * Get a single discount by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/discount/${id}`);
    return data;
  },

  /**
   * Create a new discount.
   * JSON payload must use numeric discount_percentage. Optional imageFile is uploaded after create.
   */
  create: async (
    discount: FormData | CreateDiscountPayload | Record<string, unknown>,
  ): Promise<any> => {
    if (!(discount instanceof FormData)) {
      const { imageFile, ...jsonBody } = discount as CreateDiscountPayload;
      const { data: created } = await axiosInstance.post<any>("/discount", jsonBody);

      if (imageFile instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);
        await axiosInstance.put<any>(
          `/discount/${created.id}/image`,
          imageFormData,
        );
      }

      return created;
    }

    try {
      const { data } = await axiosInstance.post<any>("/discount", discount);
      return data;
    } catch (err) {
      if (!isAxiosStatus(err, 400)) throw err;

      const imageFile = discount.get("image");
      const tempImageUrl = discount.get("tempImageUrl");
      const storeId = discount.get("storeId");

      if (
        !(imageFile instanceof File) ||
        typeof storeId !== "string" ||
        typeof tempImageUrl !== "string" ||
        !tempImageUrl
      ) {
        throw err;
      }

      const { data: created } = await axiosInstance.post<any>("/discount", {
        ...formDataToJsonBody(discount),
        storeId,
        image: tempImageUrl,
      });

      const imageFormData = new FormData();
      imageFormData.append("image", imageFile);
      await axiosInstance.put<any>(
        `/discount/${created.id}/image`,
        imageFormData,
      );

      return created;
    }
  },

  /**
   * Update an existing discount
   */
  update: async (id: string, discount: Record<string, unknown>): Promise<any> => {
    const payload = { ...discount };

    if ("productIds" in payload) {
      const productIds = sanitizeIdList(payload.productIds as unknown[]);
      if (productIds.length > 0) payload.productIds = productIds;
      else delete payload.productIds;
    }

    if ("categoryIds" in payload) {
      const categoryIds = sanitizeIdList(payload.categoryIds as unknown[]);
      if (categoryIds.length > 0) payload.categoryIds = categoryIds;
      else delete payload.categoryIds;
    }

    if (typeof payload.discount_percentage === "string") {
      const num = Number(payload.discount_percentage);
      if (Number.isFinite(num)) payload.discount_percentage = num;
    }

    const { data } = await axiosInstance.put<any>(`/discount/${id}`, payload);
    return data;
  },

  /**
   * Delete a discount (soft delete)
   */
  delete: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(`/discount/${id}`);
    return data;
  },

  /**
   * Enable a discount
   */
  enable: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>(`/discount/${id}/enable`);
    return data;
  },

  /**
   * Disable a discount
   */
  disable: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>(`/discount/${id}/disable`);
    return data;
  },

  /**
   * Add products to a discount
   */
  addProducts: async (id: string, productIds: string[]): Promise<any> => {
    const { data } = await axiosInstance.put<any>(`/discount/${id}/products`, {
      productIds,
    });
    return data;
  },

  /**
   * Add categories to a discount
   */
  addCategories: async (id: string, categoryIds: string[]): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/discount/${id}/categories`,
      {
        categoryIds,
      }
    );
    return data;
  },

  /**
   * Remove a product from a discount
   */
  removeProduct: async (id: string, productId: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/discount/${id}/products/${productId}`
    );
    return data;
  },

  /**
   * Remove a category from a discount
   */
  removeCategory: async (id: string, categoryId: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/discount/${id}/categories/${categoryId}`
    );
    return data;
  },

  /**
   * Update discount image
   */
  updateDiscountImage: async (
    discountId: string,
    image: File
  ): Promise<any> => {
    const formData = new FormData();
    formData.append("image", image);
    const { data } = await axiosInstance.put<any>(
      `/discount/${discountId}/image`,
      formData
    );
    return data;
  },

  /**
   * Delete Discount image
   */
  deleteDiscountImage: async (discountId: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/discount/${discountId}/image`
    );
    return data;
  },
};
