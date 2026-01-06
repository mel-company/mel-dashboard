import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productAPI } from "../endpoints/product.endpoints";

/**
 * Query key factory for products
 */
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params?: any) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (params?: any) => [...productKeys.all, "search", params] as const,
};

/**
 * Fetch all products with optional filtering and pagination
 */
export const useFetchProducts = (params?: any, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: productKeys.list(params),
    queryFn: () => productAPI.fetchAll(params),
    enabled,
  });
};

/**
 * Fetch all products by store domain with optional filtering and pagination
 */
export const useFetchProductsByStoreDomain = (
  domain: string,
  params?: any,
  enabled: boolean = true
) => {
  return useQuery<any>({
    queryKey: productKeys.list({ domain, ...params }),
    queryFn: () => productAPI.fetchAllByStoreDomain(domain, params),
    enabled,
  });
};

/**
 * Search for products with optional filtering and pagination
 */
export const useSearchProducts = (params?: any, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: productKeys.search(params),
    queryFn: () => productAPI.search(params),
    enabled: enabled && !!params?.query,
  });
};

/**
 * Fetch a single product by ID
 */
export const useFetchProduct = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: productKeys.detail(id),
    queryFn: () => productAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};

/**
 * Add categories to a product mutation
 */
export const useAddCategoryToProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; categoryIds: string[] }>({
    mutationFn: ({ id, categoryIds }) =>
      productAPI.addCategory(id, categoryIds),
    onSuccess: (data) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Update the specific product cache
      queryClient.setQueryData(productKeys.detail(data.id), data);
    },
  });
};

/**
 * Remove a category from a product mutation
 */
export const useRemoveCategoryFromProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; categoryId: string }>({
    mutationFn: ({ id, categoryId }) =>
      productAPI.removeCategory(id, categoryId),
    onSuccess: (data) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Update the specific product cache
      queryClient.setQueryData(productKeys.detail(data.id), data);
    },
  });
};

/**
 * Create a new product mutation
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (product: any) => productAPI.create(product),
    onSuccess: () => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

/**
 * Create a new product option mutation
 */
export const useCreateProductOption = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (option: any) => productAPI.createProductOption(option),
    onSuccess: (_, variables) => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Invalidate the specific product detail to refresh options
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
    },
  });
};

/**
 * Query key factory for product options
 */
export const productOptionKeys = {
  all: ["product-options"] as const,
  details: () => [...productOptionKeys.all, "detail"] as const,
  detail: (id: string) => [...productOptionKeys.details(), id] as const,
};

/**
 * Fetch a single product option by ID
 */
export const useFetchProductOption = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: productOptionKeys.detail(id),
    queryFn: () => productAPI.fetchOneProductOption(id),
    enabled: enabled && !!id,
  });
};

/**
 * Update a product option mutation
 */
export const useUpdateProductOption = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => productAPI.updateProductOption(id, data),
    onSuccess: (data, variables) => {
      // Invalidate product option detail
      queryClient.invalidateQueries({
        queryKey: productOptionKeys.detail(variables.id),
      });
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Invalidate the specific product detail to refresh options
      if (data?.product?.id) {
        queryClient.invalidateQueries({
          queryKey: productKeys.detail(data.product.id),
        });
      }
    },
  });
};

/**
 * Delete a product option mutation
 */
export const useDeleteProductOption = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: (id: string) => productAPI.deleteProductOption(id),
    onSuccess: (_, deletedId) => {
      // Remove the deleted option from cache
      queryClient.removeQueries({
        queryKey: productOptionKeys.detail(deletedId),
      });
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Invalidate all product details to refresh options
      queryClient.invalidateQueries({ queryKey: productKeys.details() });
    },
  });
};

/**
 * Update a product option value mutation
 */
export const useUpdateProductOptionValue = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => productAPI.updateProductOptionValue(id, data),
    onSuccess: (data) => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Invalidate all product details to refresh options
      queryClient.invalidateQueries({ queryKey: productKeys.details() });
      // Invalidate product option if we have the option ID
      if (data?.option?.id) {
        queryClient.invalidateQueries({
          queryKey: productOptionKeys.detail(data.option.id),
        });
      }
    },
  });
};

/**
 * Delete a product option value mutation
 */
export const useDeleteProductOptionValue = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: (id: string) => productAPI.deleteProductOptionValue(id),
    onSuccess: (data) => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Invalidate all product details to refresh options
      queryClient.invalidateQueries({ queryKey: productKeys.details() });
      // Invalidate product option if we have the option ID
      if (data?.option?.id) {
        queryClient.invalidateQueries({
          queryKey: productOptionKeys.detail(data.option.id),
        });
      }
    },
  });
};

/**
 * Update an existing product mutation
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => productAPI.update(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Update the specific product cache
      queryClient.setQueryData(productKeys.detail(data.id), data);
    },
  });
};

/**
 * Delete a product mutation
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => productAPI.delete(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Remove the deleted product from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(deletedId) });
    },
  });
};

/**
 * Seed dummy products mutation
 */
export const useSeedDummyProducts = () => {
  return useMutation<any, Error, any>({
    mutationFn: () => productAPI.seedDummyProducts(),
  });
};

/**
 * Find variant by product ID and selected options mutation
 */
export const useFindVariantByOptions = () => {
  return useMutation<
    any,
    Error,
    { productId: string; selectedOptions: Record<string, string> }
  >({
    mutationFn: ({ productId, selectedOptions }) =>
      productAPI.findVariantByOptions(productId, selectedOptions),
  });
};