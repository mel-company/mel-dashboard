import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { designAPI } from "../endpoints/design.endpoints";

export const designKeys = {
  all: ["store-designs"] as const,
  list: () => [...designKeys.all, "list"] as const,
};

/** The store's finished AI-generated designs. */
export const useStoreDesigns = () =>
  useQuery({
    queryKey: designKeys.list(),
    queryFn: designAPI.list,
  });

/**
 * Publish one of the store's designs.
 *
 * Resolves with `success: false` rather than rejecting when the server-side
 * preview or deploy fails, so the list is only refetched once the server says
 * the switch landed. Callers still branch on `data.success` for what to show.
 */
export const useApplyDesign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (generationId: string) => designAPI.apply(generationId),
    onSuccess: (data) => {
      if (data?.success) {
        queryClient.invalidateQueries({ queryKey: designKeys.all });
      }
    },
  });
};
