import axiosInstance from "@/utils/AxiosInstance";
import type { ProductListResponse } from "../types/product";
import { MAX_PRODUCT_IMAGES } from "../types/product";

const IMAGE_UPLOAD_TIMEOUT_MS = 60_000;

function parseJsonField(value: FormDataEntryValue | null): unknown {
  if (typeof value !== "string" || !value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function productFormDataToJson(formData: FormData): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  for (const key of ["title", "description"] as const) {
    const value = formData.get(key);
    if (typeof value === "string" && value.trim()) body[key] = value.trim();
  }

  for (const key of ["price", "cost_to_produce", "rate"] as const) {
    const value = formData.get(key);
    if (value == null || value === "") continue;
    const num = Number(value);
    if (Number.isFinite(num)) body[key] = num;
  }

  const enabled = formData.get("enabled");
  if (enabled != null && enabled !== "") {
    body.enabled = String(enabled) === "true";
  }

  for (const key of ["categoryIds", "properties", "options"] as const) {
    const parsed = parseJsonField(formData.get(key));
    if (parsed !== undefined) body[key] = parsed;
  }

  const tempImageUrl = formData.get("tempImageUrl");
  if (typeof tempImageUrl === "string" && tempImageUrl.trim()) {
    body.image = tempImageUrl.trim();
  }

  return body;
}

/** Collect image files from FormData (`images` + optional legacy `image`). Max 10. */
function collectImageFiles(formData: FormData): File[] {
  const files: File[] = [];
  const seen = new Set<string>();

  const push = (file: File) => {
    const key = `${file.name}:${file.size}:${file.lastModified}`;
    if (seen.has(key)) return;
    seen.add(key);
    files.push(file);
  };

  for (const value of formData.getAll("images")) {
    if (value instanceof File && value.size > 0) push(value);
  }

  if (files.length === 0) {
    const single = formData.get("image");
    if (single instanceof File && single.size > 0) push(single);
  }

  return files.slice(0, MAX_PRODUCT_IMAGES);
}

function appendJsonFieldsToFormData(
  target: FormData,
  body: Record<string, unknown>,
) {
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "object") {
      target.append(key, JSON.stringify(value));
    } else {
      target.append(key, String(value));
    }
  }
}

function appendImagesToFormData(target: FormData, files: File[]) {
  files.forEach((file, index) => {
    target.append("images", file);
    if (index === 0) target.append("image", file);
  });
}

function buildMultipartProductForm(
  jsonBody: Record<string, unknown>,
  files: File[],
): FormData {
  const multipart = new FormData();
  // Don't send string `image` (e.g. temp logo URL) when uploading real files —
  // it collides with the file field and can leave product.image empty/wrong.
  const { image: _ignoredImage, ...fields } = jsonBody;
  appendJsonFieldsToFormData(multipart, fields);
  appendImagesToFormData(multipart, files);
  return multipart;
}

function isAxiosStatus(err: unknown, status: number): boolean {
  return (
    (err as { response?: { status?: number } })?.response?.status === status
  );
}

export const productAPI = {
  /**
   * Get all products with cursor pagination (GET /product/cursor?cursor=&limit=)
   */
  fetchAllCursor: async (params?: {
    cursor?: string | null;
    limit?: number;
    storeId?: string;
    categoryId?: string;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/product/cursor", {
      params: {
        ...(params?.cursor && { cursor: params.cursor }),
        ...(params?.limit && { limit: params.limit }),
      },
    });

    return data;
  },

  /**
   * Get all products by store domain with cursor pagination (infinite scroll)
   */
  fetchAllByStoreDomainCursor: async (
    domain: string,
    params?: {
      categoryId?: string;
      cursor?: string | null;
      limit?: number;
    }
  ): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/product/by-store-domain/cursor",
      {
        params: {
          store: domain,
          ...(params?.categoryId && { categoryId: params.categoryId }),
          ...(params?.cursor && { cursor: params.cursor }),
          ...(params?.limit && { limit: params.limit }),
        },
      }
    );
    return data;
  },

  /**
   * Get all products by store domain with optional filtering and pagination
   */
  fetchAllByStoreDomain: async (domain: string, params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/product/by-store-domain", {
      params: {
        store: domain,
        ...(params?.categoryId && { categoryId: params.categoryId }),
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Search products (page-based, legacy)
   */
  search: async (params?: any): Promise<ProductListResponse> => {
    const { data } = await axiosInstance.get<ProductListResponse>(
      "/product/search",
      {
        params: {
          ...(params?.query && { query: params.query }),
          ...(params?.storeId && { storeId: params.storeId }),
          ...(params?.categoryId && { categoryId: params.categoryId }),
          ...(params?.page && { page: params.page }),
          ...(params?.limit && { limit: params.limit }),
        },
      }
    );
    return data;
  },

  /**
   * Search products with cursor pagination (infinite scroll)
   * GET /product/search-cursor?query=&cursor=&limit=20
   */
  fetchSearchCursor: async (params: {
    query: string;
    cursor?: string | null;
    limit?: number;
    categoryId?: string;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/product/search-cursor", {
      params: {
        query: params.query,
        ...(params.cursor && { cursor: params.cursor }),
        ...(params.limit && { limit: params.limit }),
        ...(params.categoryId && { categoryId: params.categoryId }),
      },
    });
    return data;
  },

  /**
   * Filter and/or search products with cursor pagination.
   * Supports: categoryIds, enabled. When filters are applied, search runs within filtered data.
   */
  fetchFilterCursor: async (params?: {
    query?: string | null;
    categoryIds?: string[];
    enabled?: boolean;
    cursor?: string | null;
    limit?: number;
  }): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/product/filter-cursor", {
      params: {
        ...(params?.query != null &&
          params.query !== "" && { query: params.query }),
        ...(params?.categoryIds &&
          params.categoryIds.length > 0 && { categoryIds: params.categoryIds }),
        ...(params?.enabled !== undefined && { enabled: params.enabled }),
        ...(params?.cursor && { cursor: params.cursor }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Get a single product by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/product/${id}`);
    return data;
  },

  /**
   * Create a new product.
   * With files: multipart `images` (and/or `image`), fallback JSON + POST /:id/images.
   */
  create: async (formData: FormData): Promise<any> => {
    const imageFiles = collectImageFiles(formData);
    const jsonBody = productFormDataToJson(formData);

    if (imageFiles.length > 0) {
      try {
        const { data } = await axiosInstance.post<any>(
          "/product",
          buildMultipartProductForm(jsonBody, imageFiles),
          { timeout: IMAGE_UPLOAD_TIMEOUT_MS },
        );
        return data;
      } catch (err) {
        // Some envs expect JSON create then gallery upload
        if (!isAxiosStatus(err, 400) && !isAxiosStatus(err, 415)) throw err;
      }

      const { data: created } = await axiosInstance.post<any>(
        "/product",
        jsonBody,
      );
      return productAPI.addImages(created.id, imageFiles);
    }

    const { data } = await axiosInstance.post<any>("/product", jsonBody);
    return data;
  },

  /**
   * Add categories to a product
   */
  addCategory: async (id: string, categoryIds: string[]): Promise<any> => {
    const { data } = await axiosInstance.post<any>(`/product/${id}/category`, {
      categoryIds,
    });
    return data;
  },

  /**
   * Remove a category from a product
   */
  removeCategory: async (id: string, categoryId: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/product/${id}/category/${categoryId}`
    );
    return data;
  },

  /**
   * Create a new product option
   */
  createProductOption: async (option: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/product/option", option);
    return data;
  },

  /**
   * Get a single product option by ID
   */
  fetchOneProductOption: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/product/option/${id}`);
    return data;
  },

  /**
   * Update a product option
   */
  updateProductOption: async (id: string, option: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/product/option/${id}`,
      option
    );
    return data;
  },

  /**
   * Delete a product option (soft delete)
   */
  deleteProductOption: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(`/product/option/${id}`);
    return data;
  },

  /**
   * Update a product option value
   */
  updateProductOptionValue: async (id: string, value: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/product/option-value/${id}`,
      value
    );
    return data;
  },

  /**
   * Delete a product option value (soft delete)
   */
  deleteProductOptionValue: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/product/option-value/${id}`
    );
    return data;
  },

  /**
   * Update an existing product.
   * FormData may include new gallery files via `images` / `image`.
   */
  update: async (
    id: string,
    product: FormData | Record<string, unknown>,
  ): Promise<any> => {
    if (product instanceof FormData) {
      const imageFiles = collectImageFiles(product);
      const jsonBody = productFormDataToJson(product);

      if (imageFiles.length > 0) {
        try {
          const { data } = await axiosInstance.put<any>(
            `/product/${id}`,
            buildMultipartProductForm(jsonBody, imageFiles),
            { timeout: IMAGE_UPLOAD_TIMEOUT_MS },
          );
          return data;
        } catch (err) {
          if (!isAxiosStatus(err, 400) && !isAxiosStatus(err, 415)) throw err;
          await axiosInstance.put<any>(`/product/${id}`, jsonBody);
          return productAPI.addImages(id, imageFiles);
        }
      }

      const { data } = await axiosInstance.put<any>(`/product/${id}`, jsonBody);
      return data;
    }

    const { data } = await axiosInstance.put<any>(`/product/${id}`, product);
    return data;
  },

  /**
   * Add gallery images — POST /product/:id/images (field: images)
   */
  addImages: async (productId: string, images: File[]): Promise<any> => {
    const formData = new FormData();
    images.slice(0, MAX_PRODUCT_IMAGES).forEach((file, index) => {
      formData.append("images", file);
      if (index === 0) formData.append("image", file);
    });
    const { data } = await axiosInstance.post<any>(
      `/product/${productId}/images`,
      formData,
      { timeout: IMAGE_UPLOAD_TIMEOUT_MS },
    );
    return data;
  },

  /**
   * Set primary cover image — PUT /product/:id/images/:imageId/primary
   */
  setPrimaryImage: async (productId: string, imageId: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      `/product/${productId}/images/${imageId}/primary`,
    );
    return data;
  },

  /**
   * Delete a single gallery image — DELETE /product/:id/images/:imageId
   */
  deleteGalleryImage: async (
    productId: string,
    imageId: string,
  ): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/product/${productId}/images/${imageId}`,
    );
    return data;
  },

  /**
   * Delete a product (soft delete)
   */
  delete: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(`/product/${id}`);
    return data;
  },

  /**
   * Seed dummy products
   */
  seedDummyProducts: async (): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/product/dummy");
    return data;
  },

  /**
   * Find variant by product ID and selected options
   */
  findVariantByOptions: async (
    productId: string,
    selectedOptions: Record<string, string>
  ): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/variant/find-by-options", {
      productId,
      selectedOptions,
    });
    return data;
  },

  /**
   * Add / replace cover via gallery upload (POST /product/:id/images)
   */
  updateProductImage: async (
    productId: string,
    image: File | File[],
  ): Promise<any> => {
    const files = Array.isArray(image) ? image : [image];
    return productAPI.addImages(productId, files);
  },

  /**
   * Delete all gallery images — DELETE /product/:id/image
   */
  deleteProductImage: async (productId: string): Promise<any> => {
    const { data } = await axiosInstance.delete<any>(
      `/product/${productId}/image`,
    );
    return data;
  },
};
