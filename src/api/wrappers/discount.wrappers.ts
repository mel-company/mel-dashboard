import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    onSuccess: (data) => {
      // Invalidate and refetch discounts list
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      // Update the specific discount cache
      queryClient.setQueryData(discountKeys.detail(data.id), data);
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
