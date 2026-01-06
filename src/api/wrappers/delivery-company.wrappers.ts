import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryCompanyAPI } from "../endpoints/delivery-company.endpoints";

/**
 * Query key factory for delivery companies
 */
export const deliveryCompanyKeys = {
  all: ["delivery-companies"] as const,
  lists: () => [...deliveryCompanyKeys.all, "list"] as const,
  list: () => [...deliveryCompanyKeys.lists()] as const,
  details: () => [...deliveryCompanyKeys.all, "detail"] as const,
  detail: (id: string) => [...deliveryCompanyKeys.details(), id] as const,
};

/**
 * Fetch all delivery companies
 */
export const useFetchDeliveryCompanies = (enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: deliveryCompanyKeys.list(),
    queryFn: () => deliveryCompanyAPI.fetchAll(),
    enabled,
  });
};

/**
 * Fetch a single delivery company by ID
 */
export const useFetchDeliveryCompany = (
  id: string,
  enabled: boolean = true
) => {
  return useQuery<any>({
    queryKey: deliveryCompanyKeys.detail(id),
    queryFn: () => deliveryCompanyAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};

/**
 * Create a new delivery company mutation
 */
export const useCreateDeliveryCompany = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (deliveryCompany: any) =>
      deliveryCompanyAPI.create(deliveryCompany),
    onSuccess: () => {
      // Invalidate and refetch delivery companies list
      queryClient.invalidateQueries({
        queryKey: deliveryCompanyKeys.lists(),
      });
    },
  });
};

/**
 * Update an existing delivery company mutation
 */
export const useUpdateDeliveryCompany = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => deliveryCompanyAPI.update(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch delivery companies list
      queryClient.invalidateQueries({
        queryKey: deliveryCompanyKeys.lists(),
      });
      // Update the specific delivery company cache
      queryClient.setQueryData(deliveryCompanyKeys.detail(data.id), data);
    },
  });
};

/**
 * Delete a delivery company mutation
 */
export const useDeleteDeliveryCompany = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => deliveryCompanyAPI.delete(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch delivery companies list
      queryClient.invalidateQueries({
        queryKey: deliveryCompanyKeys.lists(),
      });
      // Remove the deleted delivery company from cache
      queryClient.removeQueries({
        queryKey: deliveryCompanyKeys.detail(deletedId),
      });
    },
  });
};
