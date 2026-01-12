import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
      // Update the specific notification cache with new read status
      queryClient.invalidateQueries({
        queryKey: notificationKeys.detail(notificationId),
      });
    },
  });
};
