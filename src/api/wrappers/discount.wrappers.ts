import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { discountAPI } from "../endpoints/discount.endpoints";

/**
 * Query key factory for discounts
 */
export const discountKeys = {
  all: ["discounts"] as const,
  lists: () => [...discountKeys.all, "list"] as const,
  list: (params?: any) => [...discountKeys.lists(), params] as const,
  details: () => [...discountKeys.all, "detail"] as const,
  detail: (id: string) => [...discountKeys.details(), id] as const,
  search: (params?: any) => [...discountKeys.all, "search", params] as const,
  cursor: (params?: any) => [...discountKeys.all, "cursor", params] as const,
  availableProducts: (params?: any) =>
    [...discountKeys.all, "available-products", params] as const,
  availableProductsCursor: (id: string, params?: { limit?: number }) =>
    [...discountKeys.all, "available-products-cursor", id, params] as const,
  availableProductsSearchCursor: (
    id: string,
    params?: { query?: string | null; limit?: number }
  ) =>
    [
      ...discountKeys.all,
      "available-products-search-cursor",
      id,
      params,
    ] as const,
  availableCategories: (params?: any) =>
    [...discountKeys.all, "available-categories", params] as const,
};

/**
 * Fetch all discounts with optional filtering and pagination
 */
export const useFetchDiscounts = (params?: any, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: discountKeys.list(params),
    queryFn: () => discountAPI.fetchAll(params),
    enabled,
  });
};

/**
 * Fetch available products for a discount
 */
export const useFetchAvailableProducts = (
  params?: any,
  enabled: boolean = true
) => {
  return useQuery<any>({
    queryKey: discountKeys.availableProducts(params),
    queryFn: () => discountAPI.fetchAvailableProducts(params),
    enabled,
  });
};

/**
 * Fetch available products not related to a discount with cursor pagination (infinite scroll)
 */
export const useFetchAvailableProductsCursor = (
  discountId: string,
  params?: { limit?: number },
  enabled: boolean = true
) => {
  return useInfiniteQuery<any>({
    queryKey: discountKeys.availableProductsCursor(discountId, params),
    enabled: enabled && !!discountId,
    queryFn: ({ pageParam }) =>
      discountAPI.fetchAvailableProductsCursor(discountId, {
        cursor: typeof pageParam === "string" ? pageParam : undefined,
        limit: params?.limit,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Search available products not related to a discount with cursor pagination (infinite scroll)
 */
export const useFetchAvailableProductsSearchCursor = (
  discountId: string,
  params?: { query?: string | null; limit?: number },
  enabled: boolean = true
) => {
  return useInfiniteQuery<any>({
    queryKey: discountKeys.availableProductsSearchCursor(discountId, params),
    enabled: enabled && !!discountId,
    queryFn: ({ pageParam }) =>
      discountAPI.fetchAvailableProductsSearchCursor(discountId, {
        query: params?.query ?? undefined,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
        limit: params?.limit,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Fetch available categories for a discount
 */
export const useFetchAvailableCategories = (
  params?: any,
  enabled: boolean = true
) => {
  return useQuery<any>({
    queryKey: discountKeys.availableCategories(params),
    queryFn: () => discountAPI.fetchAvailableCategories(params),
    enabled,
  });
};

/**
 * Fetch all discounts with cursor pagination (infinite scroll)
 */
export const useFetchDiscountsCursor = (
  params?: any,
  enabled: boolean = true
) => {
  return useInfiniteQuery<any>({
    queryKey: discountKeys.cursor(params),
    enabled,
    queryFn: ({ pageParam }) =>
      discountAPI.fetchAllCursor({
        ...params,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Search discounts with cursor pagination (infinite scroll)
 */
export const useSearchDiscountsCursor = (
  params?: { query: string; limit?: number },
  enabled = true
) => {
  return useInfiniteQuery<any>({
    queryKey: discountKeys.search({ ...params, cursor: true }),
    enabled: enabled && !!params?.query?.trim(),
    queryFn: ({ pageParam }) =>
      discountAPI.fetchSearchCursor({
        query: params?.query ?? "",
        limit: params?.limit,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Search for discounts with optional filtering and pagination
 */
export const useSearchDiscounts = (params?: any, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: discountKeys.search(params),
    queryFn: () => discountAPI.search(params),
    enabled: enabled && !!params?.query,
  });
};

/**
 * Fetch a single discount by ID
 */
export const useFetchDiscount = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: discountKeys.detail(id),
    queryFn: () => discountAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};

/**
 * Create a new discount mutation
 */
export const useCreateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (discount: any) => discountAPI.create(discount),
    onSuccess: () => {
      // Invalidate and refetch discounts list
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
    },
  });
};

/**
 * Update an existing discount mutation
 */
export const useUpdateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => discountAPI.update(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch discounts list
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      // Update the specific discount cache
      queryClient.setQueryData(discountKeys.detail(data.id), data);
    },
  });
};

/**
 * Delete a discount mutation
 */
export const useDeleteDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => discountAPI.delete(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch discounts list
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      // Remove the deleted discount from cache
      queryClient.removeQueries({ queryKey: discountKeys.detail(deletedId) });
    },
  });
};

/**
 * Enable a discount mutation
 */
export const useEnableDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => discountAPI.enable(id),
    onSuccess: (data) => {
      // Invalidate and refetch discounts list
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      // Update the specific discount cache
      queryClient.setQueryData(discountKeys.detail(data.id), data);
    },
  });
};

/**
 * Disable a discount mutation
 */
export const useDisableDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => discountAPI.disable(id),
    onSuccess: (data) => {
      // Invalidate and refetch discounts list
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      // Update the specific discount cache
      queryClient.setQueryData(discountKeys.detail(data.id), data);
    },
  });
};

/**
 * Add products to a discount mutation
 */
export const useAddProductsToDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; productIds: string[] }>({
    mutationFn: ({ id, productIds }) => discountAPI.addProducts(id, productIds),
    onSuccess: (data) => {
      // Invalidate and refetch discounts list
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      // Update the specific discount cache
      queryClient.setQueryData(discountKeys.detail(data.id), data);
      // Invalidate available products cursor/search so AddDiscountProductDialog list refreshes
      queryClient.invalidateQueries({
        queryKey: [...discountKeys.all, "available-products-cursor", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...discountKeys.all,
          "available-products-search-cursor",
          data.id,
        ],
      });
    },
  });
};

/**
 * Add categories to a discount mutation
 */
export const useAddCategoriesToDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; categoryIds: string[] }>({
    mutationFn: ({ id, categoryIds }) =>
      discountAPI.addCategories(id, categoryIds),
    onSuccess: (data) => {
      // Invalidate and refetch discounts list
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      // Update the specific discount cache
      queryClient.setQueryData(discountKeys.detail(data.id), data);
      // Invalidate available categories cursor/search so AddDiscountCategoryDialog list refreshes
      queryClient.invalidateQueries({
        queryKey: ["categories", "available-cursor"],
      });
      queryClient.invalidateQueries({
        queryKey: ["categories", "available-search-cursor"],
      });
    },
  });
};

/**
 * Remove a product from a discount mutation
 */
export const useRemoveProductFromDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; productId: string }>({
    mutationFn: ({ id, productId }) => discountAPI.removeProduct(id, productId),
    onSuccess: (_, variables) => {
      const discountId = variables.id;
      // Invalidate and refetch discounts list
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: discountKeys.detail(discountId),
      });
      // Invalidate available products cursor/search for this discount
      queryClient.invalidateQueries({
        queryKey: [...discountKeys.all, "available-products-cursor", discountId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...discountKeys.all,
          "available-products-search-cursor",
          discountId,
        ],
      });
    },
  });
};

/**
 * Remove a category from a discount mutation
 */
export const useRemoveCategoryFromDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; categoryId: string }>({
    mutationFn: ({ id, categoryId }) =>
      discountAPI.removeCategory(id, categoryId),
    onSuccess: (data) => {
      // Invalidate and refetch discounts list
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      // Update the specific discount cache
      queryClient.setQueryData(discountKeys.detail(data.id), data);
    },
  });
};

/**
 * Update discount image mutation
 */
export const useUpdateDiscountImage = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { discountId: string; image: File }>({
    mutationFn: ({ discountId, image }) =>
      discountAPI.updateDiscountImage(discountId, image),
    onSuccess: (data) => {
      // Invalidate and refetch discounts list
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      // Invalidate the specific discount detail to force refetch with new image URL
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: discountKeys.detail(data.id),
        });
      }
    },
  });
};

/**
 * Delete discount image mutation
 */
export const useDeleteDiscountImage = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (discountId: string) =>
      discountAPI.deleteDiscountImage(discountId),
    onSuccess: (data) => {
      // Invalidate and refetch discounts list
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      // Invalidate the specific discount detail to force refetch
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: discountKeys.detail(data.id),
        });
      }
    },
  });
};
