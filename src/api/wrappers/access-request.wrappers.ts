import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accessRequestAPI } from "../endpoints/access-request.endpoints";
import { authKeys } from "./auth.wrappers";

export const accessRequestKeys = {
  all: ["access-requests"] as const,
  store: () => [...accessRequestKeys.all, "store"] as const,
  mine: () => [...accessRequestKeys.all, "mine"] as const,
};

export const useFetchStoreAccessRequests = (enabled = true) =>
  useQuery({
    queryKey: accessRequestKeys.store(),
    queryFn: () => accessRequestAPI.listForStore(),
    enabled,
  });

export const useFetchMyAccessRequests = (enabled = true) =>
  useQuery({
    queryKey: accessRequestKeys.mine(),
    queryFn: () => accessRequestAPI.listMine(),
    enabled,
  });

export const useCreateAccessRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { moduleName: string; message?: string }) =>
      accessRequestAPI.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accessRequestKeys.mine(),
      });
    },
  });
};

export const useApproveAccessRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      accessRequestAPI.approve(id, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accessRequestKeys.all });
      void queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
};

export const useRejectAccessRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      accessRequestAPI.reject(id, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accessRequestKeys.all });
    },
  });
};
