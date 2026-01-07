import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { policiesAPI } from "../endpoints/policies.endpoints";

/**
 * Query key factory for policies
 */
export const policiesKeys = {
  all: ["policies"] as const,
  termsAndConditions: () =>
    [...policiesKeys.all, "terms-and-conditions"] as const,
  privacyPolicy: () => [...policiesKeys.all, "privacy-policy"] as const,
  refundPolicy: () => [...policiesKeys.all, "refund-policy"] as const,
  allPolicies: () => [...policiesKeys.all, "all"] as const,
};

/**
 * Fetch terms and conditions for the current store
 */
export const useFetchTermsAndConditions = (enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: policiesKeys.termsAndConditions(),
    queryFn: () => policiesAPI.fetchTermsAndConditions(),
    enabled,
  });
};

/**
 * Create terms and conditions for the current store mutation
 */
export const useCreateTermsAndConditions = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (content: any) => policiesAPI.createTermsAndConditions(content),
    onSuccess: () => {
      // Invalidate and refetch terms and conditions
      queryClient.invalidateQueries({
        queryKey: policiesKeys.termsAndConditions(),
      });
      // Invalidate all policies cache
      queryClient.invalidateQueries({
        queryKey: policiesKeys.allPolicies(),
      });
    },
  });
};

/**
 * Update terms and conditions for the current store mutation
 */
export const useUpdateTermsAndConditions = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (content: any) => policiesAPI.updateTermsAndConditions(content),
    onSuccess: (data) => {
      // Update the terms and conditions cache
      queryClient.setQueryData(policiesKeys.termsAndConditions(), data);
      // Invalidate all policies cache
      queryClient.invalidateQueries({
        queryKey: policiesKeys.allPolicies(),
      });
    },
  });
};

/**
 * Fetch privacy policy for the current store
 */
export const useFetchPrivacyPolicy = (enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: policiesKeys.privacyPolicy(),
    queryFn: () => policiesAPI.fetchPrivacyPolicy(),
    enabled,
  });
};

/**
 * Create privacy policy for the current store mutation
 */
export const useCreatePrivacyPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (content: any) => policiesAPI.createPrivacyPolicy(content),
    onSuccess: () => {
      // Invalidate and refetch privacy policy
      queryClient.invalidateQueries({
        queryKey: policiesKeys.privacyPolicy(),
      });
      // Invalidate all policies cache
      queryClient.invalidateQueries({
        queryKey: policiesKeys.allPolicies(),
      });
    },
  });
};

/**
 * Update privacy policy for the current store mutation
 */
export const useUpdatePrivacyPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (content: any) => policiesAPI.updatePrivacyPolicy(content),
    onSuccess: (data) => {
      // Update the privacy policy cache
      queryClient.setQueryData(policiesKeys.privacyPolicy(), data);
      // Invalidate all policies cache
      queryClient.invalidateQueries({
        queryKey: policiesKeys.allPolicies(),
      });
    },
  });
};

/**
 * Fetch refund policy for the current store
 */
export const useFetchRefundPolicy = (enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: policiesKeys.refundPolicy(),
    queryFn: () => policiesAPI.fetchRefundPolicy(),
    enabled,
  });
};

/**
 * Create refund policy for the current store mutation
 */
export const useCreateRefundPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (content: any) => policiesAPI.createRefundPolicy(content),
    onSuccess: () => {
      // Invalidate and refetch refund policy
      queryClient.invalidateQueries({
        queryKey: policiesKeys.refundPolicy(),
      });
      // Invalidate all policies cache
      queryClient.invalidateQueries({
        queryKey: policiesKeys.allPolicies(),
      });
    },
  });
};

/**
 * Update refund policy for the current store mutation
 */
export const useUpdateRefundPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (content: any) => policiesAPI.updateRefundPolicy(content),
    onSuccess: (data) => {
      // Update the refund policy cache
      queryClient.setQueryData(policiesKeys.refundPolicy(), data);
      // Invalidate all policies cache
      queryClient.invalidateQueries({
        queryKey: policiesKeys.allPolicies(),
      });
    },
  });
};

/**
 * Fetch all policies (terms, privacy, refund) for the current store
 */
export const useFetchAllPolicies = (enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: policiesKeys.allPolicies(),
    queryFn: () => policiesAPI.fetchAllPolicies(),
    enabled,
  });
};
