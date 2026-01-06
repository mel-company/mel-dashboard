import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsAPI } from "../endpoints/settings.endpoints";

/**
 * Query key factory for settings
 */
export const settingsKeys = {
  all: ["settings"] as const,
  lists: () => [...settingsKeys.all, "list"] as const,
  list: () => [...settingsKeys.lists()] as const,
  details: () => [...settingsKeys.all, "detail"] as const,
  detail: (id: string) => [...settingsKeys.details(), id] as const,
  byStore: (storeId: string) =>
    [...settingsKeys.all, "store", storeId] as const,
};

/**
 * Fetch all store settings
 */
export const useFetchAllSettings = (enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: settingsKeys.list(),
    queryFn: () => settingsAPI.fetchAll(),
    enabled,
  });
};

/**
 * Fetch settings for a specific store
 */
export const useFetchSettingsByStoreId = (
  storeId: string,
  enabled: boolean = true
) => {
  return useQuery<any>({
    queryKey: settingsKeys.byStore(storeId),
    queryFn: () => settingsAPI.fetchByStoreId(storeId),
    enabled: enabled && !!storeId,
  });
};

/**
 * Fetch a single settings by ID
 */
export const useFetchSettings = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: settingsKeys.detail(id),
    queryFn: () => settingsAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};

/**
 * Create settings for a store mutation
 */
export const useCreateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (settings: any) => settingsAPI.create(settings),
    onSuccess: (data) => {
      // Invalidate and refetch settings list
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      // Update the specific settings cache if we have the ID
      if (data?.id) {
        queryClient.setQueryData(settingsKeys.detail(data.id), data);
      }
      // Update the store-specific settings cache if we have the storeId
      if (data?.storeId) {
        queryClient.setQueryData(settingsKeys.byStore(data.storeId), data);
      }
    },
  });
};

/**
 * Update settings for a store mutation (upsert - creates if not exists)
 */
export const useUpdateSettingsByStoreId = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { storeId: string; data: any }>({
    mutationFn: ({ storeId, data }) =>
      settingsAPI.updateByStoreId(storeId, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch settings list
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      // Update the store-specific settings cache
      queryClient.setQueryData(settingsKeys.byStore(variables.storeId), data);
      // Update the specific settings cache if we have the ID
      if (data?.id) {
        queryClient.setQueryData(settingsKeys.detail(data.id), data);
      }
    },
  });
};

/**
 * Update settings by ID mutation
 */
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => settingsAPI.update(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch settings list
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      // Update the specific settings cache
      queryClient.setQueryData(settingsKeys.detail(data.id), data);
      // Update the store-specific settings cache if we have the storeId
      if (data?.storeId) {
        queryClient.setQueryData(settingsKeys.byStore(data.storeId), data);
      }
    },
  });
};

/**
 * Delete settings for a store mutation
 */
export const useDeleteSettingsByStoreId = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (storeId: string) => settingsAPI.deleteByStoreId(storeId),
    onSuccess: (_, deletedStoreId) => {
      // Invalidate and refetch settings list
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      // Remove the deleted settings from cache
      queryClient.removeQueries({
        queryKey: settingsKeys.byStore(deletedStoreId),
      });
    },
  });
};

/**
 * Delete settings by ID mutation
 */
export const useDeleteSettings = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => settingsAPI.delete(id),
    onSuccess: (data, deletedId) => {
      // Invalidate and refetch settings list
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      // Remove the deleted settings from cache
      queryClient.removeQueries({
        queryKey: settingsKeys.detail(deletedId),
      });
      // Also remove from store-specific cache if we have storeId
      if (data?.storeId) {
        queryClient.removeQueries({
          queryKey: settingsKeys.byStore(data.storeId),
        });
      }
    },
  });
};
