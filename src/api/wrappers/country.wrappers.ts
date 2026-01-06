import { useQuery } from "@tanstack/react-query";
import { countryAPI } from "../endpoints/country.endpoints";

/**
 * Query key factory for countries
 */
export const countryKeys = {
  all: ["countries"] as const,
  lists: () => [...countryKeys.all, "list"] as const,
  list: () => [...countryKeys.lists()] as const,
  details: () => [...countryKeys.all, "detail"] as const,
  detail: (id: string) => [...countryKeys.details(), id] as const,
};

/**
 * Fetch all countries
 */
export const useFetchCountries = (enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: countryKeys.list(),
    queryFn: () => countryAPI.fetchAll(),
    enabled,
  });
};

/**
 * Fetch a single country by ID
 */
export const useFetchCountry = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: countryKeys.detail(id),
    queryFn: () => countryAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};

