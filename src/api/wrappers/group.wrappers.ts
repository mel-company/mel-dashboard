import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { groupAPI } from "../endpoints/group.endpoints";

/**
 * Query key factory for groups
 */
export const groupKeys = {
  all: ["groups"] as const,
  lists: () => [...groupKeys.all, "list"] as const,
  list: (params?: any) => [...groupKeys.lists(), params] as const,
  details: () => [...groupKeys.all, "detail"] as const,
  detail: (id: string) => [...groupKeys.details(), id] as const,
  cursor: (params?: any) => [...groupKeys.all, "cursor", params] as const,
  search: (params?: any) => [...groupKeys.all, "search", params] as const,
  availableCategories: (groupId: string, params?: any) =>
    [...groupKeys.all, "available-categories", groupId, params] as const,
};

/**
 * Fetch all groups with optional pagination
 */
export const useFetchGroups = (
  params?: { page?: number; limit?: number },
  enabled: boolean = true
) => {
  return useQuery<any>({
    queryKey: groupKeys.list(params),
    queryFn: () => groupAPI.fetchAll(params),
    enabled,
  });
};

/**
 * Fetch all groups with cursor pagination (infinite scroll)
 */
export const useFetchGroupsCursor = (
  params?: { cursor?: string | null; limit?: number },
  enabled: boolean = true
) => {
  return useInfiniteQuery<any>({
    queryKey: groupKeys.cursor(params),
    enabled,
    queryFn: ({ pageParam }) =>
      groupAPI.fetchAllCursor({
        ...params,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Search groups with cursor pagination (infinite scroll)
 */
export const useSearchGroupsCursor = (
  params?: { query: string; limit?: number },
  enabled = true
) => {
  return useInfiniteQuery<any>({
    queryKey: groupKeys.search({ ...params, cursor: true }),
    enabled: enabled && !!params?.query?.trim(),
    queryFn: ({ pageParam }) =>
      groupAPI.fetchSearchCursor({
        query: params?.query ?? "",
        limit: params?.limit,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Fetch a single group by ID
 */
export const useFetchGroup = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: groupKeys.detail(id),
    queryFn: () => groupAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};

/**
 * Create a new group mutation
 */
export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: (group: any) => groupAPI.create(group),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
    },
  });
};

/**
 * Update an existing group mutation
 */
export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => groupAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      queryClient.invalidateQueries({
        queryKey: groupKeys.detail(variables.id),
        refetchType: "active",
      });
    },
  });
};

/**
 * Delete a group mutation
 */
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => groupAPI.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      queryClient.removeQueries({ queryKey: groupKeys.detail(deletedId) });
    },
  });
};

/**
 * Fetch available categories not related to a group with cursor pagination (infinite scroll)
 */
export const useFetchAvailableCategoriesCursor = (
  groupId: string,
  params?: {
    cursor?: string | null;
    limit?: number;
    query?: string | null;
  },
  enabled: boolean = true
) => {
  return useInfiniteQuery<any>({
    queryKey: groupKeys.availableCategories(groupId, params),
    enabled: enabled && !!groupId,
    queryFn: ({ pageParam }) =>
      groupAPI.fetchAvailableCategoriesCursor(groupId, {
        ...params,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

/**
 * Add categories to a group mutation
 */
export const useAddCategoriesToGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { groupId: string; categoryIds: string[] }
  >({
    mutationFn: ({ groupId, categoryIds }) =>
      groupAPI.addCategories(groupId, categoryIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      if (data?.id) {
        queryClient.setQueryData(groupKeys.detail(data.id), data);
        queryClient.invalidateQueries({
          queryKey: groupKeys.availableCategories(data.id),
        });
      }
    },
  });
};

/**
 * Remove a category from a group mutation
 */
export const useRemoveCategoryFromGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { groupId: string; categoryId: string }
  >({
    mutationFn: ({ groupId, categoryId }) =>
      groupAPI.removeCategory(groupId, categoryId),
    onSuccess: (data, variables) => {
      const { groupId } = variables;
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      queryClient.invalidateQueries({
        queryKey: groupKeys.detail(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: groupKeys.availableCategories(groupId),
      });
      if (data?.id) {
        queryClient.setQueryData(groupKeys.detail(data.id), data);
      }
    },
  });
};
