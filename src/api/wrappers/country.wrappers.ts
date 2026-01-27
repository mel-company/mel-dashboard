import { useQuery } from "@tanstack/react-query";
import { countryAPI } from "../endpoints/country.endpoints";

export type Country = {
  code2: string;
  name: {
    ar: string;
    en: string;
  };
  phoneCode: string;
};

/**
 * Query key factory for countries
 */
export const countryKeys = {
  all: ["countries"] as const,
  lists: () => [...countryKeys.all, "list"] as const,
  list: () => [...countryKeys.lists()] as const,
  details: () => [...countryKeys.all, "detail"] as const,
  detail: (id: string) => [...countryKeys.details(), id] as const,
  phoneCodes: () => [...countryKeys.all, "phone-codes"] as const,
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

/**
 * Fetch all countries phone codes
 */
export const useFetchPhoneCodes = (enabled: boolean = false, order: "ar" | "en" = "ar") => {
  return useQuery<Country[]>({
    queryKey: [...countryKeys.phoneCodes(), order],
    queryFn: () => countryAPI.fetchPhoneCodes(order),
    enabled,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours (gcTime replaces cacheTime in v5)
  });
};