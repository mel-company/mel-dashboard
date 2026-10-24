import axiosInstance from "@/utils/AxiosInstance";

/** Agent turns can run tools + LLM; well past the instance 10s default. */
const TAMIMA_TURN_TIMEOUT_MS = 120_000;
/** Image regen (and similar) can take ~1 min after approve. */
const TAMIMA_APPROVE_TIMEOUT_MS = 120_000;

export type TamimaTrialBalance = {
  limit: number;
  used: number;
  remaining: number;
};

export type TamimaPocket = {
  included?: number;
  used?: number;
  remaining: number;
  purchased?: number;
  trial?: TamimaTrialBalance;
  meteredByCost: boolean;
  upgradeRequired?: boolean;
};

export type TamimaBalanceResponse = {
  unlimited: boolean;
  periodStart?: string;
  periodEnd?: string;
  has_tamima: boolean;
  tamima: TamimaPocket;
};

export type TamimaEntitlementsResponse = {
  configured: boolean;
  unlimited: boolean;
  hasTamima: boolean;
  tamima: TamimaPocket;
};

export type TamimaConversationSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type TamimaChatMessage = {
  role: "user" | "assistant";
  content: string;
  at?: string;
  actionIds?: string[];
};

export type TamimaConversation = TamimaConversationSummary & {
  messages: TamimaChatMessage[] | unknown;
  storeId?: string;
  storeUserId?: string;
};

export type TamimaActionStatus =
  | "PENDING"
  | "EXECUTING"
  | "APPLIED"
  | "REJECTED"
  | "EXPIRED"
  | "STALE"
  | "FAILED";

export type TamimaActionKind =
  | "UPDATE_PRODUCT_PRICE"
  | "UPDATE_PRODUCT_NAME"
  | "UPDATE_PRODUCT_DESCRIPTION"
  | "SET_PRODUCT_ACTIVE"
  | "REGENERATE_PRODUCT_IMAGE"
  | "UPDATE_STORE_NAME"
  | "UPDATE_STORE_DESCRIPTION"
  | "UPDATE_STORE_CONTACT"
  | "UPDATE_THEME_PRIMARY";

/** Dashboard focus so Tamima binds «هذا» to the open screen. */
export type TamimaPageContext = {
  route?: string;
  label?: string;
  productId?: string;
  categoryId?: string;
  orderId?: string;
  hint?: string;
};

/** Where to go / what to refresh after the merchant approves. */
export type TamimaUiHint = {
  navigateTo: string;
  productId?: string;
  refresh: string[];
  storefrontLive: boolean;
  needsPublish: boolean;
  toast: string;
};

export type TamimaProposedAction = {
  id: string;
  kind: TamimaActionKind | string;
  title: string;
  summary: string;
  status: TamimaActionStatus | string;
  expiresAt?: string;
  payload?: Record<string, unknown>;
  error?: string | null;
  result?: unknown;
  ui?: TamimaUiHint;
};

export type TamimaTurnResponse = {
  reply: string;
  actions: TamimaProposedAction[];
  charged: number;
  trial: boolean;
  ticketMode?: string;
};

export const tamimaAPI = {
  entitlements: async (): Promise<TamimaEntitlementsResponse> => {
    const { data } = await axiosInstance.get<TamimaEntitlementsResponse>(
      "/tamima/entitlements",
    );
    return data;
  },

  credits: async (): Promise<TamimaBalanceResponse> => {
    const { data } = await axiosInstance.get<TamimaBalanceResponse>(
      "/tamima/credits",
    );
    return data;
  },

  listConversations: async (): Promise<TamimaConversationSummary[]> => {
    const { data } = await axiosInstance.get<TamimaConversationSummary[]>(
      "/tamima/conversations",
    );
    return data;
  },

  createConversation: async (
    title?: string,
  ): Promise<TamimaConversation> => {
    const { data } = await axiosInstance.post<TamimaConversation>(
      "/tamima/conversations",
      title ? { title } : {},
    );
    return data;
  },

  getConversation: async (id: string): Promise<TamimaConversation> => {
    const { data } = await axiosInstance.get<TamimaConversation>(
      `/tamima/conversations/${id}`,
    );
    return data;
  },

  postMessage: async (
    conversationId: string,
    body: {
      message: string;
      pageContext?: TamimaPageContext | string;
      /** Optional reference photo (JPEG/PNG/WebP ≤5MB) for product image edit. */
      image?: File;
      /** Always false — writes need POST …/approve. */
      autoApply?: boolean;
    },
  ): Promise<TamimaTurnResponse> => {
    const url = `/tamima/conversations/${conversationId}/messages`;

    if (body.image) {
      const form = new FormData();
      form.append("message", body.message);
      // Do not send autoApply in multipart — string "false" fails boolean validation.
      // Backend always requires approve anyway.
      if (body.pageContext != null) {
        form.append(
          "pageContext",
          typeof body.pageContext === "string"
            ? body.pageContext
            : JSON.stringify(body.pageContext),
        );
      }
      form.append("image", body.image);
      const { data } = await axiosInstance.post<TamimaTurnResponse>(url, form, {
        timeout: TAMIMA_TURN_TIMEOUT_MS,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    }

    const { data } = await axiosInstance.post<TamimaTurnResponse>(
      url,
      {
        message: body.message,
        pageContext: body.pageContext,
        autoApply: false,
      },
      { timeout: TAMIMA_TURN_TIMEOUT_MS },
    );
    return data;
  },

  getAction: async (id: string): Promise<TamimaProposedAction> => {
    const { data } = await axiosInstance.get<TamimaProposedAction>(
      `/tamima/actions/${id}`,
    );
    return data;
  },

  approveAction: async (id: string): Promise<TamimaProposedAction> => {
    const { data } = await axiosInstance.post<TamimaProposedAction>(
      `/tamima/actions/${id}/approve`,
      {},
      { timeout: TAMIMA_APPROVE_TIMEOUT_MS },
    );
    return data;
  },

  rejectAction: async (id: string): Promise<TamimaProposedAction> => {
    const { data } = await axiosInstance.post<TamimaProposedAction>(
      `/tamima/actions/${id}/reject`,
    );
    return data;
  },

  /** Cloud TTS — returns MP3 audio (no OS voice pack). */
  speak: async (text: string): Promise<Blob> => {
    const { data } = await axiosInstance.post<Blob>(
      "/tamima/speak",
      { text },
      {
        responseType: "blob",
        timeout: 60_000,
      },
    );
    return data;
  },

  /** Cloud STT (Whisper) — Arabic transcription. */
  transcribe: async (audio: File | Blob): Promise<{ text: string }> => {
    const form = new FormData();
    const file =
      audio instanceof File
        ? audio
        : new File([audio], "tamima-voice.webm", {
            type: audio.type || "audio/webm",
          });
    form.append("audio", file);
    const { data } = await axiosInstance.post<{ text: string }>(
      "/tamima/transcribe",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60_000,
      },
    );
    return data;
  },
};
