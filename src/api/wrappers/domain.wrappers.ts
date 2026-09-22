import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  domainAPI,
  type CustomDomainResponse,
  type DomainConnectDiscovery,
  type DomainConnectStartResult,
} from "../endpoints/domain.endpoints";

/**
 * Query key factory for domains
 */
export const domainKeys = {
  all: ["domains"] as const,
  details: () => [...domainKeys.all, "detail"] as const,
  detail: () => [...domainKeys.details()] as const,
  customStatus: () => [...domainKeys.all, "custom-status"] as const,
};

/**
 * Fetch domain details
 */
export const useFindDomainDetails = () => {
  return useQuery<CustomDomainResponse>({
    queryKey: domainKeys.detail(),
    queryFn: () => domainAPI.findDomainDetails(),
  });
};

/**
 * Check domain availability
 */
export const useCheckDomainAvailability = () => {
  return useMutation<{ isAvailable: boolean }, Error, string>({
    mutationFn: (domain: string) => domainAPI.checkAvailability(domain),
  });
};

/**
 * Rename the platform slug
 */
export const useUpdateDomain = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { current: string; next: string }>({
    mutationFn: ({ current, next }) => domainAPI.updateDomain(current, next),
    onSuccess: () => {
      // Invalidate and refetch domain details
      queryClient.invalidateQueries({ queryKey: domainKeys.all });
    },
  });
};

/**
 * Attach a custom apex domain and provision its Cloudflare hostnames.
 */
export const useSetCustomDomain = () => {
  const queryClient = useQueryClient();

  return useMutation<CustomDomainResponse, Error, { domain: string }>({
    mutationFn: ({ domain }) => domainAPI.setCustomDomain(domain),
    onSuccess: (data) => {
      queryClient.setQueryData(domainKeys.customStatus(), data);
      queryClient.invalidateQueries({ queryKey: domainKeys.detail() });
    },
  });
};

const STATUS_POLL_MS = 15_000;
/** ~5 minutes of polling; past that the merchant refreshes by hand. */
const STATUS_POLL_LIMIT = 20;

/**
 * Cloudflare hostname + SSL state for the attached custom domain.
 *
 * Verification is a DNS round-trip, so a freshly attached domain sits at
 * `pending` for minutes — poll while it does. The poll is capped because every
 * tick costs the server two Cloudflare reads, a Domain Connect discovery and a
 * row write, and a domain whose records were never added stays pending for
 * hours. The refresh button keeps working after the cap.
 */
export const useCustomDomainStatus = (enabled: boolean = true) => {
  return useQuery<CustomDomainResponse>({
    queryKey: domainKeys.customStatus(),
    queryFn: () => domainAPI.getCustomDomainStatus(),
    enabled,
    refetchInterval: (query) => {
      if (query.state.data?.ssl?.status !== "pending") return false;
      return query.state.dataUpdateCount < STATUS_POLL_LIMIT
        ? STATUS_POLL_MS
        : false;
    },
  });
};

/** Path 3: discover connection mode for an owned domain (check only). */
export const useDiscoverDomainConnect = () => {
  return useMutation<DomainConnectDiscovery, Error, { domain: string }>({
    mutationFn: ({ domain }) => domainAPI.discoverConnect(domain),
  });
};

/** Path 3: get signed applyUrl then open provider UX. */
export const useStartDomainConnect = () => {
  return useMutation<DomainConnectStartResult, Error, { domain: string }>({
    mutationFn: ({ domain }) => domainAPI.startConnect(domain),
  });
};
