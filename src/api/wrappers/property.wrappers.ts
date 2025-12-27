import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyAPI } from "../endpoints/property.endpoints";
import { productKeys } from "./product.wrappers";

/**
 * Query key factory for product properties
 */
export const propertyKeys = {
  all: ["product-properties"] as const,
  lists: () => [...propertyKeys.all, "list"] as const,
  list: (params?: any) => [...propertyKeys.lists(), params] as const,
  details: () => [...propertyKeys.all, "detail"] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
};

/**
 * Fetch all product properties with optional filtering by product ID
 */
export const useFetchProperties = (params?: { productId?: string }, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: propertyKeys.list(params),
    queryFn: () => propertyAPI.fetchAll(params),
    enabled,
  });
};

/**
 * Fetch a single product property by ID
 */
export const useFetchProperty = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: propertyKeys.detail(id),
    queryFn: () => propertyAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};

/**
 * Create a new product property mutation
 */
export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (property: any) => propertyAPI.create(property),
    onSuccess: (_, variables) => {
      // Invalidate properties list
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      // Invalidate the specific product detail to refresh properties
      if (variables.productId) {
        queryClient.invalidateQueries({
          queryKey: productKeys.detail(variables.productId),
        });
      }
      // Invalidate all product details to refresh properties
      queryClient.invalidateQueries({ queryKey: productKeys.details() });
    },
  });
};

/**
 * Update an existing product property mutation
 */
export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => propertyAPI.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch properties list
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      // Update the specific property cache
      queryClient.setQueryData(propertyKeys.detail(variables.id), data);
      // Invalidate all product details to refresh properties
      queryClient.invalidateQueries({ queryKey: productKeys.details() });
    },
  });
};

/**
 * Delete a product property mutation
 */
export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: (id: string) => propertyAPI.delete(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch properties list
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      // Remove the deleted property from cache
      queryClient.removeQueries({ queryKey: propertyKeys.detail(deletedId) });
      // Invalidate all product details to refresh properties
      queryClient.invalidateQueries({ queryKey: productKeys.details() });
    },
  });
};

