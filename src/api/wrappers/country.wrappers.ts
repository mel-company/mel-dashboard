import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
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
  cursor: (params?: { cursor?: string | null; limit?: number }) =>
    [...countryKeys.all, "cursor", params] as const,
  searchCursor: (params?: {
    query: string;
    cursor?: string | null;
    limit?: number;
  }) => [...countryKeys.all, "search-cursor", params] as const,
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
 * Fetch all countries with cursor pagination (infinite scroll)
 */
export const useFetchAllCursor = (
  params?: { limit?: number },
  enabled: boolean = true,
) => {
  return useInfiniteQuery<any>({
    queryKey: countryKeys.cursor(params),
    enabled,
    queryFn: ({ pageParam }) =>
      countryAPI.fetchAllCursor({
        ...params,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
};

/**
 * Search countries with cursor pagination (infinite scroll)
 */
export const useSearchCursor = (
  params?: { query: string; limit?: number },
  enabled: boolean = true,
) => {
  return useInfiniteQuery<any>({
    queryKey: countryKeys.searchCursor(params),
    enabled: enabled && !!params?.query?.trim(),
    queryFn: ({ pageParam }) =>
      countryAPI.searchCursor({
        query: params?.query ?? "",
        limit: params?.limit,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
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
export const useFetchPhoneCodes = (
  enabled: boolean = false,
  order: "ar" | "en" = "ar",
) => {
  return useQuery<Country[]>({
    queryKey: [...countryKeys.phoneCodes(), order],
    queryFn: () => countryAPI.fetchPhoneCodes(order),
    enabled,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours (gcTime replaces cacheTime in v5)
  });
};
