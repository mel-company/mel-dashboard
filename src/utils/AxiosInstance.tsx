import axios from "axios";
import { clearAuthSession, redirectToLogin } from "@/utils/auth-session";
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

function isConsumeBridgeRequest(config: { url?: string; baseURL?: string }) {
  const url = `${config.baseURL ?? ""}${config.url ?? ""}`;
  return url.includes("/store-user-auth/consume-bridge");
}

axiosInstance.interceptors.request.use(
  (config) => {
    const subdomain = getTenantSubdomain();
    if (subdomain) {
      config.headers["domain-name"] = subdomain;
      config.headers["x-tenant-subdomain"] = subdomain;
    }

    // Bridge token lives in the body. Don't attach a stored JWT / API key.
    if (isConsumeBridgeRequest(config)) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Authorization");
      } else {
        delete config.headers["Authorization"];
      }
    } else {
      const token = localStorage.getItem("token");
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
  (error) => {
    const onBridgePage = window.location.pathname === "/bridge";
    if (
      error.response?.status === 401 &&
      !onBridgePage &&
      !isConsumeBridgeRequest(error.config ?? {})
    ) {
      clearAuthSession();
      redirectToLogin();
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
