import { useQuery } from "@tanstack/react-query";
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