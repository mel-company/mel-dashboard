import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketAPI } from "../endpoints/ticket.endpoints";
import type { CreateStoreSupportTicketDto } from "../endpoints/ticket.endpoints";

/** Params for fetch-all (pagination) */
export interface FetchTicketsStoreParams {
  page?: number;
  limit?: number;
}

/** Params for search (query required, pagination optional) */
export interface SearchTicketsStoreParams {
  query: string;
  page?: number;
  limit?: number;
}

/**
 * Query key factory for support tickets
 */
export const ticketKeys = {
  all: ["tickets"] as const,
  store: {
    lists: () => [...ticketKeys.all, "store", "list"] as const,
    list: (params?: FetchTicketsStoreParams) =>
      [...ticketKeys.store.lists(), params] as const,
    search: (params?: SearchTicketsStoreParams) =>
      [...ticketKeys.store.lists(), "search", params] as const,
    details: () => [...ticketKeys.all, "store", "detail"] as const,
    detail: (id: string) => [...ticketKeys.store.details(), id] as const,
  },
};

// ─── Store user hooks ───────────────────────────────────────────────────────

/** Fetch all support tickets for the store (store user). Pass { page, limit } for pagination. */
export const useFetchTicketsStore = (
  params?: FetchTicketsStoreParams,
  enabled: boolean = true
) => {
  return useQuery<any>({
    queryKey: ticketKeys.store.list(params),
    queryFn: () => ticketAPI.fetchAllStore(params),
    enabled,
  });
};

/** Search support tickets (store user). Uses query + optional page/limit. Enabled only when params.query is non-empty. */
export const useSearchTicketsStore = (
  params: SearchTicketsStoreParams | undefined,
  enabled: boolean = true
) => {
  return useQuery<any>({
    queryKey: ticketKeys.store.search(params),
    queryFn: () => ticketAPI.searchStore(params!),
    enabled: enabled && !!params?.query?.trim(),
  });
};

/** Fetch one support ticket by id (store user) */
export const useFetchTicketStore = (id: string, enabled: boolean = true) => {
  return useQuery<any>({
    queryKey: ticketKeys.store.detail(id),
    queryFn: () => ticketAPI.fetchOneStore(id),
    enabled: enabled && !!id,
  });
};

/** Create a support ticket (store user) */
export const useCreateTicketStore = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, CreateStoreSupportTicketDto>({
    mutationFn: (body) => ticketAPI.createStore(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.store.lists() });
    },
  });
};

/** Cancel a support ticket (store user) */
export const useCancelTicketStore = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: (id) => ticketAPI.cancelStore(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.store.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.store.detail(id) });
    },
  });
};

/** Close a support ticket (store user) */
export const useCloseTicketStore = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: (id) => ticketAPI.closeStore(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.store.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.store.detail(id) });
    },
  });
};

/** Delete a support ticket (store user) */
export const useDeleteTicketStore = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: (id) => ticketAPI.deleteStore(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.store.lists() });
      queryClient.removeQueries({ queryKey: ticketKeys.store.detail(id) });
    },
  });
};

/** Send a message on a ticket (store user) */
export const useSendMessageStore = () => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    Error,
    { ticketId: string; message: string }
  >({
    mutationFn: (body) => ticketAPI.sendMessageStore(body),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({
        queryKey: ticketKeys.store.detail(ticketId),
      });
    },
  });
};
