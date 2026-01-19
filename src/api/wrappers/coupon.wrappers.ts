import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { couponAPI } from "../endpoints/coupon.endpoints";

/**
 * Query key factory for coupons
 */
export const couponKeys = {
  all: ["coupons"] as const,
  lists: () => [...couponKeys.all, "list"] as const,
  list: (params?: any) => [...couponKeys.lists(), params] as const,
  details: () => [...couponKeys.all, "detail"] as const,
  detail: (id: string) => [...couponKeys.details(), id] as const,
  search: (params?: any) => [...couponKeys.all, "search", params] as const,
  codeAvailability: (params?: any) => [...couponKeys.all, "code-availability", params] as const,
};

/**
 * Fetch all coupons with optional filtering and pagination
 */
export const useFetchCoupons = (params?: any, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: couponKeys.list(params),
    queryFn: () => couponAPI.fetchAll(params),
    enabled,
  });
};

/**
 * Search for coupons with optional filtering and pagination
 */
export const useSearchCoupons = (params?: any, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: couponKeys.search(params),
    queryFn: () => couponAPI.search(params),
    enabled: enabled && !!params?.query,
  });
};

/**
 * Fetch a single coupon by ID
 */
export const useFetchCoupon = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: couponKeys.detail(id),
    queryFn: () => couponAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};


/**
 * Create a new coupon
 */
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (coupon: any) => couponAPI.create(coupon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: couponKeys.search() });
    },
  });
};

/**
 * Delete a coupon mutation
 */
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: (id: string) => couponAPI.remove(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({
        queryKey: couponKeys.detail(deletedId),
      });
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: couponKeys.details() });
    },
  });
};

/**
 * Check if a coupon code is available
 */
export const useCheckCodeAvailability = (
  params?: { code: string; excludeCouponId?: string },
  enabled: boolean = true
) => {
  return useQuery<any>({
    queryKey: couponKeys.codeAvailability(params),
    queryFn: () => couponAPI.checkCodeAvailability(params),
    enabled: enabled && !!params?.code,
  });
};
