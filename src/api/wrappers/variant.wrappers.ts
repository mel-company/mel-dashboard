import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { variantAPI } from "../endpoints/variant.endpionts";
import { productKeys } from "./product.wrappers";

/**
 * Query key factory for product variants
 */
export const variantKeys = {
  all: ["product-variants"] as const,
  lists: () => [...variantKeys.all, "list"] as const,
  list: (params?: any) => [...variantKeys.lists(), params] as const,
  details: () => [...variantKeys.all, "detail"] as const,
  detail: (id: string) => [...variantKeys.details(), id] as const,
};

/**
 * Fetch all product variants with optional filtering by product ID
 */
export const useFetchVariants = (params?: { productId?: string }, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: variantKeys.list(params),
    queryFn: () => variantAPI.fetchAll(params),
    enabled,
  });
};

/**
 * Fetch a single product variant by ID
 */
export const useFetchVariant = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: variantKeys.detail(id),
    queryFn: () => variantAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};

/**
 * Create a new product variant mutation
 */
export const useCreateVariant = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (variant: any) => variantAPI.create(variant),
    onSuccess: (_, variables) => {
      // Invalidate variants list
      queryClient.invalidateQueries({ queryKey: variantKeys.lists() });
      // Invalidate the specific product detail to refresh variants
      if (variables.productId) {
        queryClient.invalidateQueries({
          queryKey: productKeys.detail(variables.productId),
        });
      }
      // Invalidate all product details to refresh variants
      queryClient.invalidateQueries({ queryKey: productKeys.details() });
    },
  });
};

/**
 * Update an existing product variant mutation
 */
export const useUpdateVariant = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => variantAPI.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch variants list
      queryClient.invalidateQueries({ queryKey: variantKeys.lists() });
      // Update the specific variant cache
      queryClient.setQueryData(variantKeys.detail(variables.id), data);
      // Invalidate all product details to refresh variants
      queryClient.invalidateQueries({ queryKey: productKeys.details() });
    },
  });
};

/**
 * Delete a product variant mutation
 */
export const useDeleteVariant = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: (id: string) => variantAPI.delete(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch variants list
      queryClient.invalidateQueries({ queryKey: variantKeys.lists() });
      // Remove the deleted variant from cache
      queryClient.removeQueries({ queryKey: variantKeys.detail(deletedId) });
      // Invalidate all product details to refresh variants
      queryClient.invalidateQueries({ queryKey: productKeys.details() });
    },
  });
};

