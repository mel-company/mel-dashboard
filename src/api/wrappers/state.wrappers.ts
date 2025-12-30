import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stateAPI } from "../endpoints/state.endpoints";

/**
 * Query key factory for states
 */
export const stateKeys = {
  all: ["states"] as const,
  lists: () => [...stateKeys.all, "list"] as const,
  list: (countryId?: string) => [...stateKeys.lists(), countryId] as const,
  details: () => [...stateKeys.all, "detail"] as const,
  detail: (id: string) => [...stateKeys.details(), id] as const,
};

/**
 * Fetch all states with optional filtering by country
 */
export const useFetchStates = (countryId?: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: stateKeys.list(countryId),
    queryFn: () => stateAPI.fetchAll(countryId),
    enabled,
  });
};

/**
 * Fetch a single state by ID
 */
export const useFetchState = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: stateKeys.detail(id),
    queryFn: () => stateAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};

/**
 * Create a new state mutation
 */
export const useCreateState = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (state: any) => stateAPI.create(state),
    onSuccess: (data) => {
      // Invalidate and refetch states list
      queryClient.invalidateQueries({ queryKey: stateKeys.lists() });
      // Update the specific state cache
      queryClient.setQueryData(stateKeys.detail(data.id), data);
    },
  });
};

/**
 * Update an existing state mutation
 */
export const useUpdateState = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => stateAPI.update(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch states list
      queryClient.invalidateQueries({ queryKey: stateKeys.lists() });
      // Update the specific state cache
      queryClient.setQueryData(stateKeys.detail(data.id), data);
    },
  });
};

/**
 * Delete a state mutation
 */
export const useDeleteState = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => stateAPI.delete(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch states list
      queryClient.invalidateQueries({ queryKey: stateKeys.lists() });
      // Remove the deleted state from cache
      queryClient.removeQueries({ queryKey: stateKeys.detail(deletedId) });
    },
  });
};

