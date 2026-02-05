import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { categoryAPI } from "../endpoints/category.endpoints";

/**
 * Query key factory for categories
 */
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params?: any) => [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  search: (params?: any) => [...categoryKeys.all, "search", params] as const,
  cursor: (params?: any) => [...categoryKeys.all, "cursor", params] as const,
  available: (params?: any) =>
    [...categoryKeys.all, "available", params] as const,
  availableCursor: (params?: {
    discountId?: string;
    productId?: string;
    limit?: number;
  }) => [...categoryKeys.all, "available-cursor", params] as const,
  availableSearchCursor: (params?: {
    discountId?: string;
    productId?: string;
    query?: string | null;
    limit?: number;
  }) =>
    [...categoryKeys.all, "available-search-cursor", params] as const,
  availableProducts: (id: string) =>
    [...categoryKeys.all, "available-products", id] as const,
  availableProductsCursor: (id: string, params?: { limit?: number }) =>
    [...categoryKeys.all, "available-products-cursor", id, params] as const,
  availableProductsSearchCursor: (
    id: string,
    params?: { query?: string | null; limit?: number }
  ) =>
    [
      ...categoryKeys.all,
      "available-products-search-cursor",
      id,
      params,
    ] as const,
};

/**
 * Fetch all categories with optional filtering and pagination
 */
export const useFetchCategories = (params?: any, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryAPI.fetchAll(params),
    enabled,
  });
};

/**
 * Fetch all categories with cursor pagination (infinite scroll)
 */
export const useFetchCategoriesCursor = (
  params?: any,
  enabled: boolean = true
) => {
  return useInfiniteQuery<any>({
    queryKey: categoryKeys.cursor(params),
    enabled,
    queryFn: ({ pageParam }) =>
      categoryAPI.fetchAllCursor({
        ...params,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Search categories with cursor pagination (infinite scroll)
 */
export const useSearchCategoriesCursor = (
  params?: { query: string; limit?: number },
  enabled = true
) => {
  return useInfiniteQuery<any>({
    queryKey: categoryKeys.search({ ...params, cursor: true }),
    enabled: enabled && !!params?.query?.trim(),
    queryFn: ({ pageParam }) =>
      categoryAPI.fetchSearchCursor({
        query: params?.query ?? "",
        limit: params?.limit,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Fetch all categories by store domain with optional filtering and pagination
 */
export const useFetchCategoriesByStoreDomain = (
  domain: string,
  enabled: boolean = true
) => {
  return useQuery<any>({
    queryKey: categoryKeys.list({ domain }),
    queryFn: () => categoryAPI.fetchAllByStoreDomain(domain),
    enabled,
  });
};

/**
 * Search for categories with optional filtering and pagination
 */
export const useSearchCategories = (params?: any, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: categoryKeys.search(params),
    queryFn: () => categoryAPI.search(params),
    enabled: enabled && !!params?.query,
  });
};

/**
 * Fetch a single category by ID
 */
export const useFetchCategory = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};

/**
 * Create a new category mutation
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (category: any) => categoryAPI.create(category),
    onSuccess: () => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};

/**
 * Update an existing category mutation
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => categoryAPI.update(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      // Update the specific category cache
      queryClient.setQueryData(categoryKeys.detail(data.id), data);
    },
  });
};

/**
 * Delete a category mutation
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => categoryAPI.delete(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      // Remove the deleted category from cache
      queryClient.removeQueries({ queryKey: categoryKeys.detail(deletedId) });
    },
  });
};

/**
 * Fetch available categories not related to a discount or product
 */
export const useFetchAvailableCategories = (
  params?: { discountId?: string; productId?: string },
  enabled: boolean = true
) => {
  return useQuery<any>({
    queryKey: categoryKeys.available(params),
    queryFn: () => categoryAPI.fetchAvailable(params),
    enabled: enabled && !!(params?.discountId || params?.productId),
  });
};

/**
 * Fetch available categories not related to a discount or product with cursor pagination (infinite scroll)
 */
export const useFetchAvailableCategoriesCursor = (
  params?: { discountId?: string; productId?: string; limit?: number },
  enabled: boolean = true
) => {
  return useInfiniteQuery<any>({
    queryKey: categoryKeys.availableCursor(params),
    enabled:
      enabled &&
      !!(params?.discountId || params?.productId) &&
      !(params?.discountId && params?.productId),
    queryFn: ({ pageParam }) =>
      categoryAPI.fetchAvailableCategoriesCursor({
        ...params,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Search available categories not related to a discount or product with cursor pagination (infinite scroll)
 */
export const useFetchAvailableCategoriesSearchCursor = (
  params?: {
    discountId?: string;
    productId?: string;
    query?: string | null;
    limit?: number;
  },
  enabled: boolean = true
) => {
  return useInfiniteQuery<any>({
    queryKey: categoryKeys.availableSearchCursor(params),
    enabled:
      enabled &&
      !!(params?.discountId || params?.productId) &&
      !(params?.discountId && params?.productId),
    queryFn: ({ pageParam }) =>
      categoryAPI.fetchAvailableCategoriesSearchCursor({
        ...params,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Add products to a category mutation
 */
export const useAddProductsToCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; productIds: string[] }>({
    mutationFn: ({ id, productIds }) => categoryAPI.addProducts(id, productIds),
    onSuccess: (data) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      // Update the specific category cache
      queryClient.setQueryData(categoryKeys.detail(data.id), data);
      // Invalidate available products (and cursor) for this category
      queryClient.invalidateQueries({
        queryKey: categoryKeys.availableProducts(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: [...categoryKeys.all, "available-products-cursor", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...categoryKeys.all,
          "available-products-search-cursor",
          data.id,
        ],
      });
    },
  });
};

/**
 * Remove a product from a category mutation
 */
export const useRemoveProductFromCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; productId: string }>({
    mutationFn: ({ id, productId }) => categoryAPI.removeProduct(id, productId),
    onSuccess: (_, variables) => {
      const categoryId = variables.id;
      // Invalidate and refetch categories list and category detail
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(categoryId),
      });
      // Invalidate available products (and cursor) for this category
      queryClient.invalidateQueries({
        queryKey: categoryKeys.availableProducts(categoryId),
      });
      queryClient.invalidateQueries({
        queryKey: [...categoryKeys.all, "available-products-cursor", categoryId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...categoryKeys.all,
          "available-products-search-cursor",
          categoryId,
        ],
      });
    },
  });
};

/**
 * Fetch available products not related to a category
 */
export const useFetchAvailableProducts = (
  discountId: string,
  enabled: boolean = true
) => {
  return useQuery<any>({
    queryKey: categoryKeys.availableProducts(discountId),
    queryFn: () => categoryAPI.fetchAvailableProducts(discountId),
    enabled: enabled && !!discountId,
  });
};

/**
 * Fetch available products not related to a category with cursor pagination (infinite scroll)
 */
export const useFetchAvailableProductsCursor = (
  categoryId: string,
  params?: { limit?: number },
  enabled: boolean = true
) => {
  return useInfiniteQuery<any>({
    queryKey: categoryKeys.availableProductsCursor(categoryId, params),
    enabled: enabled && !!categoryId,
    queryFn: ({ pageParam }) =>
      categoryAPI.fetchAvailableProductsCursor(categoryId, {
        cursor: typeof pageParam === "string" ? pageParam : undefined,
        limit: params?.limit,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Search available products not related to a category with cursor pagination (infinite scroll)
 */
export const useFetchAvailableProductsSearchCursor = (
  categoryId: string,
  params?: { query?: string | null; limit?: number },
  enabled: boolean = true
) => {
  return useInfiniteQuery<any>({
    queryKey: categoryKeys.availableProductsSearchCursor(categoryId, params),
    enabled: enabled && !!categoryId,
    queryFn: ({ pageParam }) =>
      categoryAPI.fetchAvailableProductsSearchCursor(categoryId, {
        query: params?.query ?? undefined,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
        limit: params?.limit,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Toggle category enabled status mutation
 */
export const useToggleCategoryEnabled = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => categoryAPI.toggleEnabled(id),
    onSuccess: (data) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      // Update the specific category cache
      queryClient.setQueryData(categoryKeys.detail(data.id), data);
    },
  });
};

/**
 * Update category image mutation
 */
export const useUpdateCategoryImage = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { categoryId: string; image: File }>({
    mutationFn: ({ categoryId, image }) =>
      categoryAPI.updateCategoryImage(categoryId, image),
    onSuccess: (data) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      // Invalidate the specific category detail to force refetch with new image URL
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: categoryKeys.detail(data.id),
        });
      }
    },
  });
};

/**
 * Delete category image mutation
 */
export const useDeleteCategoryImage = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (categoryId: string) =>
      categoryAPI.deleteCategoryImage(categoryId),
    onSuccess: (data) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      // Invalidate the specific category detail to force refetch
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: categoryKeys.detail(data.id),
        });
      }
    },
  });
};
