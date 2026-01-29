import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
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
  cursor: (params?: any) => [...couponKeys.all, "cursor", params] as const,
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
 * Fetch all coupons with cursor pagination (infinite scroll)
 */
export const useFetchCouponsCursor = (params?: any, enabled: boolean = true) => {
  return useInfiniteQuery<any>({
    queryKey: couponKeys.cursor(params),
    enabled,
    queryFn: ({ pageParam }) =>
      couponAPI.fetchAllCursor({
        ...params,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Search coupons with cursor pagination (infinite scroll)
 */
export const useSearchCouponsCursor = (
  params?: { query: string; limit?: number },
  enabled = true,
) => {
  return useInfiniteQuery<any>({
    queryKey: couponKeys.search({ ...params, cursor: true }),
    enabled: enabled && !!params?.query?.trim(),
    queryFn: ({ pageParam }) =>
      couponAPI.fetchSearchCursor({
        query: params?.query ?? "",
        limit: params?.limit,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
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
      queryClient.invalidateQueries({ queryKey: couponKeys.cursor() });
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
      queryClient.invalidateQueries({ queryKey: couponKeys.cursor() });
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

/**
 * Toggle coupon active status mutation
 */
export const useToggleCouponActive = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: (id: string) => couponAPI.toggleActive(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: couponKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: couponKeys.cursor() });
      queryClient.invalidateQueries({ queryKey: couponKeys.search() });
    },
  });
};

/**
 * Update a coupon mutation
 */
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => couponAPI.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: couponKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: couponKeys.cursor() });
      queryClient.invalidateQueries({ queryKey: couponKeys.search() });
    },
  });
};
