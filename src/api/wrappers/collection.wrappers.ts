import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { collectionAPI } from "../endpoints/collection.endpoints";

export interface CollectionListItem {
  id: string;
  name: string;
  enabled: boolean;
  createdAt: string;
  _count?: { products: number };
  /** A few members, for the row's thumbnails — a collection has no image. */
  products?: { product: { id: string; title?: string; image?: string } }[];
}

/** Query key factory for collections. */
export const collectionKeys = {
  all: ["collections"] as const,
  lists: () => [...collectionKeys.all, "list"] as const,
  details: () => [...collectionKeys.all, "detail"] as const,
  detail: (id: string) => [...collectionKeys.details(), id] as const,
  filterCursor: (params?: {
    query?: string | null;
    enabled?: boolean;
    limit?: number;
  }) => [...collectionKeys.all, "filter-cursor", params] as const,
  availableProductsCursor: (id: string, params?: { limit?: number }) =>
    [...collectionKeys.all, "available-products-cursor", id, params] as const,
  availableProductsSearchCursor: (
    id: string,
    params?: { query?: string | null; limit?: number }
  ) =>
    [
      ...collectionKeys.all,
      "available-products-search-cursor",
      id,
      params,
    ] as const,
};

export const useFilterCollectionsCursor = (params?: {
  query?: string | null;
  enabled?: boolean;
  limit?: number;
}) => {
  return useInfiniteQuery<any>({
    queryKey: collectionKeys.filterCursor(params),
    queryFn: ({ pageParam }) =>
      collectionAPI.fetchFilterCursor({
        query: params?.query ?? undefined,
        enabled: params?.enabled,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
        limit: params?.limit,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

export const useFetchCollection = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: collectionKeys.detail(id),
    queryFn: () => collectionAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};

export const useCreateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { name: string; enabled?: boolean; productIds?: string[] }
  >({
    mutationFn: (body) => collectionAPI.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
};

export const useUpdateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { id: string; data: { name?: string; enabled?: boolean } }
  >({
    mutationFn: ({ id, data }) => collectionAPI.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
      queryClient.setQueryData(collectionKeys.detail(variables.id), data);
    },
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => collectionAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
};

export const useToggleCollectionEnabled = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => collectionAPI.toggleEnabled(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
};

export const useAddProductsToCollection = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; productIds: string[] }>({
    mutationFn: ({ id, productIds }) => collectionAPI.addProducts(id, productIds),
    onSuccess: () => {
      // The whole namespace: adding a product changes the detail page, the
      // list's product count *and* what the picker may still offer.
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
};

export const useRemoveProductFromCollection = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; productId: string }>({
    mutationFn: ({ id, productId }) => collectionAPI.removeProduct(id, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
};

export const useFetchAvailableProductsCursor = (
  collectionId: string,
  params?: { limit?: number },
  enabled: boolean = true
) => {
  return useInfiniteQuery<any>({
    queryKey: collectionKeys.availableProductsCursor(collectionId, params),
    enabled: enabled && !!collectionId,
    queryFn: ({ pageParam }) =>
      collectionAPI.fetchAvailableProductsCursor(collectionId, {
        cursor: typeof pageParam === "string" ? pageParam : undefined,
        limit: params?.limit,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};

export const useFetchAvailableProductsSearchCursor = (
  collectionId: string,
  params?: { query?: string | null; limit?: number },
  enabled: boolean = true
) => {
  return useInfiniteQuery<any>({
    queryKey: collectionKeys.availableProductsSearchCursor(collectionId, params),
    enabled: enabled && !!collectionId,
    queryFn: ({ pageParam }) =>
      collectionAPI.fetchAvailableProductsSearchCursor(collectionId, {
        query: params?.query ?? undefined,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
        limit: params?.limit,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};
