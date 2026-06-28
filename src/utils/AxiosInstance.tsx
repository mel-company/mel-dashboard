import axios from "axios";
import { parse } from "tldts";

const parsed = parse(window.location.hostname);

// const domain = getDomain(window.location.hostname);

// const subdomain = getSubdomain(window.location.hostname);

// In dev, use Vite proxy (/api/v1 → api.mel.iq) to avoid CORS
const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.mel.iq/api/v1";

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
    "domain-name": parsed.subdomain,
    "x-tenant-subdomain": parsed.subdomain,
  },
  // Needed so the browser will store/send httpOnly cookies (e.g. `sat`)
  withCredentials: true,
});

// Interceptors
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Axios 1.x uses AxiosHeaders — delete() is required so multipart boundary is set correctly
    if (config.data instanceof FormData) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type");
      } else {
        delete config.headers["Content-Type"];
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
