import axios from "axios";
import { getDomain, getSubdomain, parse } from "tldts";

const parsed = parse(window.location.hostname);
console.log("parsed", parsed);

const domain = getDomain(window.location.hostname);
console.log("domain", domain);

const subdomain = getSubdomain(window.location.hostname);
console.log("subdomain", subdomain);

// In dev, always use proxy (same-origin) to avoid CORS with subdomains (fashion.localhost, tech.localhost)
const baseURL = import.meta.env.DEV
  ? "/api/v1"
  : (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1");

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
    "domain-name": parsed.subdomain,
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

    // If the data is FormData, remove Content-Type header to let browser/axios set it automatically with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log(error.response);
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
