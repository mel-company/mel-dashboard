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

/**
 * Update store delivery company mutation
 */
export const useUpdateDeliveryCompany = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (deliveryCompanyId: string) =>
      settingsAPI.updateDeliveryCompany(deliveryCompanyId),
    onSuccess: (data) => {
      // Invalidate and refetch settings list
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      // Update the store-specific settings cache if we have the storeId
      if (data?.storeId) {
        queryClient.setQueryData(settingsKeys.byStore(data.storeId), data);
      }
      // Update the specific settings cache if we have the ID
      if (data?.id) {
        queryClient.setQueryData(settingsKeys.detail(data.id), data);
      }
      // Invalidate current settings
      queryClient.invalidateQueries({ queryKey: ["settings", "current"] });
    },
  });
};

/**
 * Update store payment methods mutation
 */
export const useUpdatePaymentMethods = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (paymentMethods: any) =>
      settingsAPI.updatePaymentMethods(paymentMethods),
    onSuccess: (data) => {
      // Invalidate and refetch settings list
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      // Update the store-specific settings cache if we have the storeId
      if (data?.storeId) {
        queryClient.setQueryData(settingsKeys.byStore(data.storeId), data);
      }
      // Update the specific settings cache if we have the ID
      if (data?.id) {
        queryClient.setQueryData(settingsKeys.detail(data.id), data);
      }
      // Invalidate current settings
      queryClient.invalidateQueries({ queryKey: ["settings", "current"] });
    },
  });
};

/**
 * Update store details mutation
 */
export const useUpdateStoreDetails = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (storeDetails: any) =>
      settingsAPI.updateStoreDetails(storeDetails),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      if (data?.storeId) {
        queryClient.setQueryData(settingsKeys.byStore(data.storeId), data);
      }
      if (data?.id) {
        queryClient.setQueryData(settingsKeys.detail(data.id), data);
      }
      queryClient.invalidateQueries({ queryKey: ["settings", "current"] });
    },
  });
};

/**
 * Update store general settings mutation
 */
export const useUpdateGeneralSettings = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (generalSettings: any) =>
      settingsAPI.updateGeneralSettings(generalSettings),
    onSuccess: (data) => {
      // Invalidate and refetch settings list
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      // Update the store-specific settings cache if we have the storeId
      if (data?.storeId) {
        queryClient.setQueryData(settingsKeys.byStore(data.storeId), data);
      }
      // Update the specific settings cache if we have the ID
      if (data?.id) {
        queryClient.setQueryData(settingsKeys.detail(data.id), data);
      }
      // Invalidate current settings
      queryClient.invalidateQueries({ queryKey: ["settings", "current"] });
    },
  });
};

/**
 * Query key for current store settings
 */
export const currentSettingsKey = ["settings", "current"] as const;

/**
 * Fetch settings for the current store user
 */
export const useFetchCurrentSettings = (enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: currentSettingsKey,
    queryFn: () => settingsAPI.fetchCurrent(),
    enabled,
  });
};

/**
 * Update settings for the current store user mutation (upsert - creates if not exists)
 */
export const useUpdateCurrentSettings = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (settings: any) => settingsAPI.updateCurrent(settings),
    onSuccess: (data) => {
      // Invalidate and refetch settings list
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      // Update the current settings cache
      queryClient.setQueryData(currentSettingsKey, data);
      // Update the store-specific settings cache if we have the storeId
      if (data?.storeId) {
        queryClient.setQueryData(settingsKeys.byStore(data.storeId), data);
      }
      // Update the specific settings cache if we have the ID
      if (data?.id) {
        queryClient.setQueryData(settingsKeys.detail(data.id), data);
      }
    },
  });
};

/**
 * Update store logo mutation
 */
export const useUpdateStoreLogo = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, File>({
    mutationFn: (logo: File) => settingsAPI.updateStoreLogo(logo),
    onSuccess: (data) => {
      // Invalidate and refetch settings list
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      // Invalidate current settings to refetch with new logo
      queryClient.invalidateQueries({ queryKey: currentSettingsKey });
      // Update the store-specific settings cache if we have the storeId
      if (data?.storeId) {
        queryClient.invalidateQueries({
          queryKey: settingsKeys.byStore(data.storeId),
        });
      }
      // Invalidate store details queries to get updated logo
      queryClient.invalidateQueries({ queryKey: ["store", "details"] });
    },
  });
};

/**
 * Delete store logo mutation
 */
export const useDeleteStoreLogo = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, void>({
    mutationFn: () => settingsAPI.deleteStoreLogo(),
    onSuccess: (data) => {
      // Invalidate and refetch settings list
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      // Invalidate current settings to refetch without logo
      queryClient.invalidateQueries({ queryKey: currentSettingsKey });
      // Update the store-specific settings cache if we have the storeId
      if (data?.storeId) {
        queryClient.invalidateQueries({
          queryKey: settingsKeys.byStore(data.storeId),
        });
      }
      // Invalidate store details queries to get updated logo (null)
      queryClient.invalidateQueries({ queryKey: ["store", "details"] });
    },
  });
};