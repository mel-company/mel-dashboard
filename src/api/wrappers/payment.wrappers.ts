
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentAPI } from "../endpoints/payment.endpoints";

/**
 * Query key factory for orders
 */
export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: (params?: any) => [...paymentKeys.lists(), params] as const,
};

/**
 * Fetch all orders with optional filtering and pagination
 */
export const useFetchPaymentProviders = (params?: any, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentAPI.fetchAll(params),
    enabled,
  });
};