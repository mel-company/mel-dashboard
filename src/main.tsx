import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./contexts/AuthContext";
import { AppsProvider } from "./contexts/AppsContext";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { planKeys } from "./api/wrappers/plan.wrappers";
import { loadClarity } from "./utils/clarity";

loadClarity();

// Any create or delete can move a plan cap (products, categories, coupons…),
// so the usage behind the cap notices is refreshed after every mutation. Only
// a screen that shows it refetches.
const queryClient: QueryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: planKeys.entitlements() }),
  }),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <AppsProvider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
          </AppsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
