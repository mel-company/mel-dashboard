import type { QueryClient } from "@tanstack/react-query";
import { authKeys } from "@/api/wrappers/auth.wrappers";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

export type AuthTokens = {
  token?: string | null;
  refreshToken?: string | null;
  jwt?: string | null;
  accessToken?: string | null;
};

/** Pull token fields from verify / bridge / refresh payloads. */
export function extractAuthTokens(data: unknown): {
  token?: string;
  refreshToken?: string;
} {
  if (!data || typeof data !== "object") return {};
  const root = data as Record<string, unknown>;
  const nested =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : null;

  const pick = (obj: Record<string, unknown> | null) => {
    if (!obj) return {};
    const token = obj.token ?? obj.jwt ?? obj.accessToken;
    const refreshToken = obj.refreshToken ?? obj.refresh_token;
    return {
      ...(typeof token === "string" && token ? { token } : {}),
      ...(typeof refreshToken === "string" && refreshToken
        ? { refreshToken }
        : {}),
    };
  };

  return { ...pick(nested), ...pick(root) };
}

export function persistAuthTokens(data: AuthTokens | unknown) {
  const tokens = extractAuthTokens(data);

  if (tokens.token) {
    localStorage.setItem(TOKEN_KEY, tokens.token);
  }
  if (tokens.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearAuthSession(queryClient?: QueryClient) {
  localStorage.removeItem("lgd");
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("auth");
  localStorage.removeItem("user");

  if (queryClient) {
    queryClient.removeQueries({ queryKey: authKeys.all });
    queryClient.cancelQueries({ queryKey: authKeys.all });
  }
}

export function isAuthSessionMarked(): boolean {
  return localStorage.getItem("lgd") === "true";
}

export function markAuthSession(queryClient?: QueryClient) {
  localStorage.setItem("lgd", "true");

  if (queryClient) {
    queryClient.invalidateQueries({ queryKey: authKeys.all });
  }
}

/** Persist tokens (if any) and mark the session. */
export function establishAuthSession(
  data?: unknown,
  queryClient?: QueryClient,
) {
  if (data) persistAuthTokens(data);
  markAuthSession(queryClient);
}

export function redirectToLogin() {
  const path = window.location.pathname;
  if (path === "/login" || path === "/bridge" || path.startsWith("/dev-login")) {
    return;
  }
  window.location.replace("/login");
}
