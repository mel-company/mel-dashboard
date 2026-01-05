import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderAPI } from "../endpoints/order.endpoints";

/**
 * Query key factory for orders
 */
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (params?: any) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  search: (params?: any) => [...orderKeys.all, "search", params] as const,
};

/**
 * Fetch all orders with optional filtering and pagination
 */
export const useFetchOrders = (params?: any, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: orderKeys.list(params),
    queryFn: () => orderAPI.fetchAll(params),
    enabled,
  });
};

/**
 * Update delivery address of an order by ID
 */
export const useUpdateDeliveryAddress = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (deliveryAddress: any) =>
      orderAPI.updateDeliveryAddress(id, deliveryAddress),
    onSuccess: () => {
      // Invalidate and refetch the specific order
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      // Also invalidate the orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

/**
 * Search for orders with optional filtering and pagination
 */
export const useSearchOrders = (params?: any, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: orderKeys.search(params),
    queryFn: () => orderAPI.search(params),
    enabled: enabled && !!params?.query,
  });
};

/**
 * Fetch a single order by ID
 */
export const useFetchOrder = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};

/**
 * Checkout a new order mutation
 */
export const useCheckoutOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (order: any) => orderAPI.createOrder(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

/**
 * Create a new order mutation
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (order: any) => orderAPI.create(order),
    onSuccess: () => {
      // Invalidate and refetch orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

/**
 * Update an existing order mutation
 */
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => orderAPI.update(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      // Update the specific order cache
      queryClient.setQueryData(orderKeys.detail(data.id), data);
    },
  });
};

/**
 * Delete an order mutation
 */
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => orderAPI.delete(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      // Remove the deleted order from cache
      queryClient.removeQueries({ queryKey: orderKeys.detail(deletedId) });
    },
  });
};

/**
 * Update an order product mutation
 */
export const useUpdateOrderProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { orderId: string; productId: string; data: any }
  >({
    mutationFn: ({ orderId, productId, data }) =>
      orderAPI.updateOrderProduct(orderId, productId, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch the specific order
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.orderId),
      });
      // Also invalidate the orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};
