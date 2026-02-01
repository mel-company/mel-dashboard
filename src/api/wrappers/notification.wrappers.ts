import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { notificationAPI } from "../endpoints/notification.endpoints";

/**
 * Query key factory for notifications
 */
export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (params?: any) => [...notificationKeys.lists(), params] as const,
  details: () => [...notificationKeys.all, "detail"] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  search: (params?: any) =>
    [...notificationKeys.all, "search", params] as const,
  cursor: (params?: any) => [...notificationKeys.all, "cursor", params] as const,
  sample: () => [...notificationKeys.all, "sample"] as const,
};

/**
 * Fetch all notifications with optional filtering and pagination
 */
export const useFetchNotifications = (
  params?: any,
  enabled: boolean = true
) => {
  return useQuery<any>({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationAPI.fetchAll(params),
    enabled,
  });
};

/**
 * Fetch all notifications with cursor pagination (infinite scroll)
 */
export const useFetchNotificationsCursor = (
  params?: any,
  enabled: boolean = true
) => {
  return useInfiniteQuery<any>({
    queryKey: notificationKeys.cursor(params),
    enabled,
    queryFn: ({ pageParam }) =>
      notificationAPI.fetchAllCursor({
        ...params,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Search notifications with cursor pagination (infinite scroll)
 */
export const useSearchNotificationsCursor = (
  params?: { query: string; limit?: number },
  enabled = true
) => {
  return useInfiniteQuery<any>({
    queryKey: notificationKeys.search({ ...params, cursor: true }),
    enabled: enabled && !!params?.query?.trim(),
    queryFn: ({ pageParam }) =>
      notificationAPI.fetchSearchCursor({
        query: params?.query ?? "",
        limit: params?.limit,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Search for notifications with optional filtering and pagination
 */
export const useSearchNotifications = (
  params?: any,
  enabled: boolean = true
) => {
  return useQuery<any>({
    queryKey: notificationKeys.search(params),
    queryFn: () => notificationAPI.search(params),
    enabled: enabled && !!params?.query,
  });
};

/**
 * Fetch a single notification by ID
 */
export const useFetchNotification = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};

/**
 * Create a new notification mutation
 */
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (notification: any) => notificationAPI.create(notification),
    onSuccess: () => {
      // Invalidate and refetch notifications list
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.cursor() });
    },
  });
};

/**
 * Update an existing notification mutation
 */
export const useUpdateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => notificationAPI.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch notifications list
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.cursor() });
      // Update the specific notification cache
      queryClient.setQueryData(notificationKeys.detail(variables.id), data);
    },
  });
};

/**
 * Delete a notification mutation
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => notificationAPI.delete(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch notifications list
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.cursor() });
      // Remove the deleted notification from cache
      queryClient.removeQueries({
        queryKey: notificationKeys.detail(deletedId),
      });
    },
  });
};

/**
 * Update read status of a notification for the current user mutation
 */
export const useUpdateNotificationReadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => notificationAPI.updateReadStatus(id),
    onSuccess: (_, notificationId) => {
      // Invalidate and refetch notifications list
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.cursor() });
      // Update the specific notification cache with new read status
      queryClient.invalidateQueries({
        queryKey: notificationKeys.detail(notificationId),
      });
      // Invalidate sample cache
      queryClient.invalidateQueries({ queryKey: notificationKeys.sample() });
    },
  });
};

/**
 * Fetch sample of notifications (at most 5) for the current user
 */
export const useFetchNotificationSample = (enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: notificationKeys.sample(),
    queryFn: () => notificationAPI.notificationSample(),
    enabled,
  });
};
