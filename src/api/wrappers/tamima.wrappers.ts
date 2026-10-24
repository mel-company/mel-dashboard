import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  tamimaAPI,
  type TamimaBalanceResponse,
  type TamimaConversation,
  type TamimaConversationSummary,
  type TamimaEntitlementsResponse,
  type TamimaPageContext,
  type TamimaProposedAction,
  type TamimaTurnResponse,
} from "../endpoints/tamima.endpoints";

export const tamimaKeys = {
  all: ["tamima"] as const,
  entitlements: () => [...tamimaKeys.all, "entitlements"] as const,
  credits: () => [...tamimaKeys.all, "credits"] as const,
  conversations: () => [...tamimaKeys.all, "conversations"] as const,
  conversation: (id: string) =>
    [...tamimaKeys.conversations(), id] as const,
  action: (id: string) => [...tamimaKeys.all, "action", id] as const,
};

export const useTamimaEntitlements = (enabled: boolean = true) =>
  useQuery<TamimaEntitlementsResponse>({
    queryKey: tamimaKeys.entitlements(),
    queryFn: () => tamimaAPI.entitlements(),
    enabled,
    staleTime: 30_000,
  });

export const useTamimaCredits = (enabled: boolean = true) =>
  useQuery<TamimaBalanceResponse>({
    queryKey: tamimaKeys.credits(),
    queryFn: () => tamimaAPI.credits(),
    enabled,
    staleTime: 15_000,
  });

export const useTamimaConversations = (enabled: boolean = true) =>
  useQuery<TamimaConversationSummary[]>({
    queryKey: tamimaKeys.conversations(),
    queryFn: () => tamimaAPI.listConversations(),
    enabled,
  });

export const useTamimaConversation = (
  id: string | null,
  enabled: boolean = true,
) =>
  useQuery<TamimaConversation>({
    queryKey: tamimaKeys.conversation(id || ""),
    queryFn: () => tamimaAPI.getConversation(id!),
    enabled: enabled && !!id,
  });

export const useCreateTamimaConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title?: string) => tamimaAPI.createConversation(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tamimaKeys.conversations() });
    },
  });
};

export const usePostTamimaMessage = () => {
  const queryClient = useQueryClient();
  return useMutation<
    TamimaTurnResponse,
    Error,
    {
      conversationId: string;
      message: string;
      pageContext?: TamimaPageContext | string;
      image?: File;
      autoApply?: boolean;
    }
  >({
    mutationFn: ({ conversationId, message, pageContext, image }) =>
      tamimaAPI.postMessage(conversationId, {
        message,
        pageContext,
        image,
        autoApply: false,
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: tamimaKeys.conversation(vars.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: tamimaKeys.credits() });
      queryClient.invalidateQueries({ queryKey: tamimaKeys.entitlements() });
    },
  });
};

export const useTamimaAction = (id: string | null, enabled: boolean = true) =>
  useQuery<TamimaProposedAction>({
    queryKey: tamimaKeys.action(id || ""),
    queryFn: () => tamimaAPI.getAction(id!),
    enabled: enabled && !!id,
  });

export const useApproveTamimaAction = () => {
  const queryClient = useQueryClient();
  return useMutation<TamimaProposedAction, Error, string>({
    mutationFn: (id) => tamimaAPI.approveAction(id),
    onSuccess: (action) => {
      queryClient.setQueryData(tamimaKeys.action(action.id), action);
      queryClient.invalidateQueries({ queryKey: tamimaKeys.conversations() });
    },
  });
};

export const useRejectTamimaAction = () => {
  const queryClient = useQueryClient();
  return useMutation<TamimaProposedAction, Error, string>({
    mutationFn: (id) => tamimaAPI.rejectAction(id),
    onSuccess: (action) => {
      queryClient.setQueryData(tamimaKeys.action(action.id), action);
    },
  });
};

/** Remaining credits for UI: unlimited, included+purchased, or trial. */
export function tamimaRemainingLabel(
  balance: TamimaBalanceResponse | TamimaEntitlementsResponse | undefined,
): string | null {
  if (!balance) return null;
  if (balance.unlimited) return "غير محدود";
  const pocket = balance.tamima;
  if (!pocket) return null;
  if (pocket.upgradeRequired) return "انتهى الرصيد";
  const remaining = Number(pocket.remaining ?? 0);
  const trialLeft = Number(pocket.trial?.remaining ?? 0);
  if (remaining > 0) return `${formatCredits(remaining)} رصيد`;
  if (trialLeft > 0) return `${trialLeft} تجربة`;
  return `${formatCredits(remaining)} رصيد`;
}

function formatCredits(n: number) {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace(/\.?0+$/, "");
}
