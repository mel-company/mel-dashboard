import type { QueryClient } from "@tanstack/react-query";
import { authKeys } from "@/api/wrappers/auth.wrappers";

export function clearAuthSession(queryClient?: QueryClient) {
  localStorage.removeItem("lgd");
  localStorage.removeItem("token");
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

export function redirectToLogin() {
  const path = window.location.pathname;
  if (path === "/login" || path.startsWith("/dev-login")) return;
  window.location.replace("/login");
}
