import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { regionAPI } from "../endpoints/region.endpoints";

/**
 * Query key factory for regions
 */
export const regionKeys = {
  all: ["regions"] as const,
  lists: () => [...regionKeys.all, "list"] as const,
  list: (stateId?: string) => [...regionKeys.lists(), stateId] as const,
  byState: (stateId: string) => [...regionKeys.all, "by-state", stateId] as const,
  details: () => [...regionKeys.all, "detail"] as const,
  detail: (id: string) => [...regionKeys.details(), id] as const,
};

/**
 * Fetch all regions with optional filtering by state
 */
export const useFetchRegions = (stateId?: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: regionKeys.list(stateId),
    queryFn: () => regionAPI.fetchAll(stateId),
    enabled,
  });
};

/**
 * Fetch all regions by state ID
 */
export const useFetchRegionsByState = (stateId: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: regionKeys.byState(stateId),
    queryFn: () => regionAPI.fetchByState(stateId),
    enabled: enabled && !!stateId,
  });
};

/**
 * Fetch a single region by ID
 */
export const useFetchRegion = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: regionKeys.detail(id),
    queryFn: () => regionAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};

/**
 * Create a new region mutation
 */
export const useCreateRegion = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (region: any) => regionAPI.create(region),
    onSuccess: (data) => {
      // Invalidate and refetch regions list
      queryClient.invalidateQueries({ queryKey: regionKeys.lists() });
      // Invalidate regions by state cache for the state this region belongs to
      if (data.state_id) {
        queryClient.invalidateQueries({ queryKey: regionKeys.byState(data.state_id) });
      }
      // Update the specific region cache
      queryClient.setQueryData(regionKeys.detail(data.id), data);
    },
  });
};

/**
 * Update an existing region mutation
 */
export const useUpdateRegion = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => regionAPI.update(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch regions list
      queryClient.invalidateQueries({ queryKey: regionKeys.lists() });
      // Invalidate regions by state cache for both old and new state (if state_id changed)
      if (data.state_id) {
        queryClient.invalidateQueries({ queryKey: regionKeys.byState(data.state_id) });
      }
      // Update the specific region cache
      queryClient.setQueryData(regionKeys.detail(data.id), data);
    },
  });
};

/**
 * Delete a region mutation
 */
export const useDeleteRegion = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => regionAPI.delete(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch regions list
      queryClient.invalidateQueries({ queryKey: regionKeys.lists() });
      // Invalidate all regions by state caches (since we don't know which state it belonged to)
      queryClient.invalidateQueries({ queryKey: [...regionKeys.all, "by-state"] });
      // Remove the deleted region from cache
      queryClient.removeQueries({ queryKey: regionKeys.detail(deletedId) });
    },
  });
};

