import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { domainAPI } from "../endpoints/domain.endpoints";

/**
 * Query key factory for discounts
 */
export const domainKeys = {
  all: ["domains"] as const,
  details: () => [...domainKeys.all, "detail"] as const,
  detail: () => [...domainKeys.details()] as const,
};

/**
 * Fetch domain details
 */
export const useFindDomainDetails = () => {
  return useQuery<any>({
    queryKey: domainKeys.detail(),
    queryFn: () => domainAPI.findDomainDetails(),
  });
};

/**
 * Check domain availability
 */
export const useCheckDomainAvailability = () => {
  return useMutation<any, Error, any>({
    mutationFn: (domain: string) => domainAPI.checkAvailability(domain),
  });
};

/**
 * Update domain
 */
export const useUpdateDomain = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (domain: string) => domainAPI.updateDomain(domain),
    onSuccess: () => {
      // Invalidate and refetch domain details
      queryClient.invalidateQueries({ queryKey: domainKeys.detail() });
    },
  });
};