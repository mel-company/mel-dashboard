import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { customerAPI } from "../endpoints/customer.endpoints";
import { entityQueryPredicate } from "../utils/entity-queries";
import { statsKeys } from "./stats.wrappers";

/**
 * Query key factory for customers
 */
export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (params?: any) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  search: (params?: any) => [...customerKeys.all, "search", params] as const,
  cursor: (params?: any) => [...customerKeys.all, "cursor", params] as const,
};

/**
 * Every cached query that holds a customer, under either naming scheme — the
 * `customerKeys` factory and the `["customer/…", …]` the list pages get from
 * `useTableData`. See `entityQueryPredicate` for why both exist and why a
 * `queryKey` cannot reach them both.
 */
export const isCustomerQuery = entityQueryPredicate("customer");

/**
 * Fetch all customers with optional filtering and pagination
 */
export const useFetchCustomers = (params?: any, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: customerKeys.list(params),
    queryFn: () => customerAPI.fetchAll(params),
    enabled,
  });
};

/**
 * Fetch all customers with cursor pagination (infinite scroll)
 */
export const useFetchCustomersCursor = (params?: any, enabled: boolean = true) => {
  return useInfiniteQuery<any>({
    queryKey: customerKeys.cursor(params),
    enabled,
    queryFn: ({ pageParam }) =>
      customerAPI.fetchAllCursor({
        ...params,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Search customers with cursor pagination (infinite scroll)
 */
export const useSearchCustomersCursor = (
  params?: { query: string; limit?: number },
  enabled = true,
) => {
  return useInfiniteQuery<any>({
    queryKey: customerKeys.search({ ...params, cursor: true }),
    enabled: enabled && !!params?.query?.trim(),
    queryFn: ({ pageParam }) =>
      customerAPI.fetchSearchCursor({
        query: params?.query ?? "",
        limit: params?.limit,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Search for customers with optional filtering and pagination
 */
export const useSearchCustomers = (params?: any, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: customerKeys.search(params),
    queryFn: () => customerAPI.search(params),
    enabled: enabled && !!params?.query,
  });
};

/**
 * Fetch a single customer by ID
 */
export const useFetchCustomer = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};

/**
 * Create a new customer mutation
 */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (customer: any) => customerAPI.create(customer),
    onSuccess: () => {
      // Invalidate and refetch customers list
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.cursor() });
    },
  });
};

/**
 * Update an existing customer mutation
 */
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => customerAPI.update(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch customers list
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.cursor() });
      // Update the specific customer cache
      queryClient.setQueryData(customerKeys.detail(data.id), data);
    },
  });
};

/**
 * Delete a customer mutation
 */
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => customerAPI.delete(id),
    onSuccess: (_, deletedId) => {
      // By predicate, not by key. The list page is keyed
      // `["customer/cursor", "list", {…}]` by `useTableData`, which neither
      // `customerKeys.lists()` nor `customerKeys.cursor()` is a prefix of — so
      // the deleted row stayed on screen for the five minutes of `staleTime`.
      queryClient.invalidateQueries({ predicate: isCustomerQuery });
      // Remove the deleted customer from cache
      queryClient.removeQueries({ queryKey: customerKeys.detail(deletedId) });
      // The page's header counts come from the store stats, not from the list.
      queryClient.invalidateQueries({ queryKey: statsKeys.all });
    },
  });
};

