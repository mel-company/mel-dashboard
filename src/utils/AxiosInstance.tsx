import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  persistAuthTokens,
  redirectToLogin,
} from "@/utils/auth-session";
import { getTenantSubdomain } from "@/utils/tenant-subdomain";

/**
 * Prefer same-origin `/api/v1` so:
 * - production `dash.{store}.mel.iq` goes through the Gateway (tenant = hasan)
 * - local Vite uses the `/api/v1` proxy
 *
 * Set `VITE_API_BASE_URL` to an absolute URL only when you must bypass the
 * Gateway (e.g. direct local backend: http://localhost:3000/api/v1).
 */
function resolveApiBaseUrl(): string {
  // On dash.{store}.mel.iq always stay same-origin so Safari sends `sat`.
  // Ignore an absolute VITE_API_BASE_URL baked in by Vercel production env.
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (host === "mel.iq" || host.endsWith(".mel.iq")) {
      return "/api/v1";
    }
  }

  const raw = String(import.meta.env.VITE_API_BASE_URL ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/+$/, "");

  if (!raw) return "/api/v1";

  // Absolute override (local API / special envs)
  if (/^https?:\/\//i.test(raw)) return raw;

  // Relative override e.g. /api/v1 or /api
  if (raw.startsWith("/")) return raw;

  return "/api/v1";
}

const baseURL = resolveApiBaseUrl();
const tenantSubdomain = getTenantSubdomain();

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    // Fallback tenant headers for Vite proxy / non-Gateway setups.
    // On dash.{store}.mel.iq the Gateway should also inject x-tenant-subdomain.
    ...(tenantSubdomain
      ? {
          "domain-name": tenantSubdomain,
          "x-tenant-subdomain": tenantSubdomain,
        }
      : {}),
  },
  // Needed so the browser will store/send httpOnly cookies (e.g. `sat`)
  withCredentials: true,
});

function requestUrl(config?: { url?: string; baseURL?: string }) {
  return `${config?.baseURL ?? ""}${config?.url ?? ""}`;
}

function isConsumeBridgeRequest(config?: { url?: string; baseURL?: string }) {
  return requestUrl(config).includes("/store-user-auth/consume-bridge");
}

function isRefreshRequest(config?: { url?: string; baseURL?: string }) {
  return requestUrl(config).includes("/store-user-auth/refresh");
}

function isAuthBypassRequest(config?: { url?: string; baseURL?: string }) {
  return isConsumeBridgeRequest(config) || isRefreshRequest(config);
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      const { data } = await axiosInstance.post<any>(
        "/store-user-auth/refresh",
        { refreshToken },
      );
      persistAuthTokens(data);
      return getAccessToken();
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

axiosInstance.interceptors.request.use(
  (config) => {
    const subdomain = getTenantSubdomain();
    if (subdomain) {
      config.headers["domain-name"] = subdomain;
      config.headers["x-tenant-subdomain"] = subdomain;
    }

    // Bridge token lives in the body. Refresh sends its own refreshToken.
    // Don't attach a stored JWT / API key for those.
    if (isAuthBypassRequest(config)) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Authorization");
      } else {
        delete config.headers["Authorization"];
      }
    } else {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (import.meta.env.VITE_API_KEY) {
        config.headers.Authorization = `Bearer ${import.meta.env.VITE_API_KEY}`;
      } else if (typeof config.headers.delete === "function") {
        config.headers.delete("Authorization");
      } else {
        delete config.headers["Authorization"];
      }
    }

    if (config.data instanceof FormData) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type");
      } else {
        delete config.headers["Content-Type"];
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const onBridgePage = window.location.pathname === "/bridge";
    const status = error.response?.status;

    if (
      status !== 401 ||
      !original ||
      original._retry ||
      onBridgePage ||
      isAuthBypassRequest(original)
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    const newToken = await refreshAccessToken();
    if (newToken) {
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(original);
    }

    clearAuthSession();
    redirectToLogin();
    return Promise.reject(error);
  },
);

export default axiosInstance;
