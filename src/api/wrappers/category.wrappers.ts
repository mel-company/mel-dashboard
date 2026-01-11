import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  available: (params?: any) =>
    [...categoryKeys.all, "available", params] as const,
  availableProducts: (id: string) =>
    [...categoryKeys.all, "available-products", id] as const,
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
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
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
 * Add products to a category mutation
 */
export const useAddProductsToCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; productIds: string[] }>({
    mutationFn: ({ id, productIds }) => categoryAPI.addProducts(id, productIds),
    onSuccess: (data) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      // Update the specific category cache
      queryClient.setQueryData(categoryKeys.detail(data.id), data);
      // Invalidate available products for this category
      queryClient.invalidateQueries({
        queryKey: categoryKeys.availableProducts(data.id),
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
    onSuccess: (data) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      // Update the specific category cache
      queryClient.setQueryData(categoryKeys.detail(data.id), data);
      // Invalidate available products for this category
      queryClient.invalidateQueries({
        queryKey: categoryKeys.availableProducts(data.id),
      });
    },
  });
};

/**
 * Fetch available products not related to a category
 */
export const useFetchAvailableProducts = (
  categoryId: string,
  enabled: boolean = true
) => {
  return useQuery<any>({
    queryKey: categoryKeys.availableProducts(categoryId),
    queryFn: () => categoryAPI.fetchAvailableProducts(categoryId),
    enabled: enabled && !!categoryId,
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
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      if (data?.id) {
        queryClient.setQueryData(categoryKeys.detail(data.id), data);
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
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      if (data?.id) {
        queryClient.setQueryData(categoryKeys.detail(data.id), data);
        queryClient.invalidateQueries({
          queryKey: categoryKeys.detail(data.id),
        });
      }
    },
  });
};
