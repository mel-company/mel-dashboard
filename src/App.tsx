import "./App.css";
import Layout from "./layout/Layout";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./contexts/AuthContext";
import { mainRoutes, settingsRoutes, publicRoutes, renderRoute } from "./utils/routes";
import PrivateRoute from "./pages/RBAC/PrivateRoute";
import NotFoundPage from "./pages/miscellaneous/NotFoundPage";
import OrderInvoicePreview from "./pages/order/OrderInvoicePreview";
import SettingsLayout from "./layout/SettingsLayout";
import Payment from "./pages/payment/Payment";
import { useConsumeBridge } from "./api/wrappers/auth.wrappers";
import { authAPI } from "./api/endpoints/auth.endpoints";
import { markAuthSession } from "./utils/auth-session";
import { getTenantSubdomain } from "./utils/tenant-subdomain";
import AuthLoadingScreen from "./components/AuthLoadingScreen";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <NotFoundPage /> : <Navigate to="/login" replace />;
}

function getBridgeErrorMessage(error: unknown): { status: string; message: string } {
  if (typeof error === "object" && error !== null) {
    const response = (error as { response?: { status?: number; data?: { message?: string } } }).response;
    const message =
      response?.data?.message ||
      (error as { message?: string }).message ||
      "unknown";
    return {
      status: response?.status != null ? String(response.status) : "no-response",
      message: String(message),
    };
  }

  return { status: "no-response", message: String(error) };
}

function Bridge() {
  const { mutate: consumeBridge } = useConsumeBridge();
  const queryClient = useQueryClient();
  const token = new URLSearchParams(window.location.search).get("token");
  const [logs, setLogs] = useState<string[]>(() => {
    const now = () => new Date().toLocaleTimeString();
    const initial = [
      `${now()}  [BRIDGE] mounted ✅`,
      `${now()}  [BRIDGE] token exists ${token ? "✅" : "❌"}`,
      `${now()}  [BRIDGE] host ${window.location.host}`,
    ];

    if (!token) {
      initial.push(`${now()}  [BRIDGE] NO TOKEN → /login in 8s`);
    } else {
      initial.push(`${now()}  [BRIDGE] calling consumeBridge...`);
    }

    return initial;
  });

  const addLog = (line: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}  ${line}`]);
  };

  useEffect(() => {
    if (!token) {
      const id = window.setTimeout(() => window.location.replace("/login"), 8000);
      return () => window.clearTimeout(id);
    }

    consumeBridge(
      { token },
      {
        onSuccess: async (data) => {
          addLog("[BRIDGE] SUCCESS ✅");
          addLog(`[BRIDGE] status ${data?.status ?? "ok"}`);
          try {
            markAuthSession(queryClient);
            addLog("[BRIDGE] auth session marked ✅");
            addLog("[ME] calling...");
            addLog(`[ME] tenant: ${getTenantSubdomain() || "(empty)"}`);

            try {
              const me = await authAPI.me();
              addLog("[ME] status: 200");
              addLog("[ME] ok: true");
              addLog(`[ME] result: ${me ? "user object" : "null"}`);
            } catch (meError) {
              addLog("[ME] ERROR ❌");
              addLog(meError instanceof Error ? meError.message : String(meError));
            }

            addLog("[BRIDGE] redirect / in 12s");
            window.setTimeout(() => window.location.replace("/"), 12000);
          } catch (error) {
            addLog("[BRIDGE] markAuthSession ERROR ❌");
            addLog(error instanceof Error ? error.message : String(error));
          }
        },
        onError: (error) => {
          const details = getBridgeErrorMessage(error);
          addLog("[BRIDGE] ERROR ❌");
          addLog(`[BRIDGE] http ${details.status}`);
          addLog(`[BRIDGE] ${details.message}`);
          addLog("[BRIDGE] redirect /login in 8s");
          window.setTimeout(() => window.location.replace("/login"), 8000);
        },
      },
    );
  }, [token, consumeBridge, queryClient]);

  return (
    <div className="relative min-h-screen">
      <AuthLoadingScreen message="جاري تسجيل الدخول..." />
      <pre
        dir="ltr"
        className="fixed inset-x-3 bottom-3 z-50 max-h-[45vh] overflow-auto rounded-lg bg-black/90 p-3 text-left text-[11px] leading-5 text-green-300 shadow-lg"
      >
        {logs.join("\n") || "waiting..."}
      </pre>
    </div>
  );
}


function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/bridge" element={<Bridge />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            {mainRoutes.map((route, index) => renderRoute(route, index))}

            <Route path="/settings" element={<SettingsLayout />}>
              {settingsRoutes.map((route, index) => renderRoute(route, index))}
            </Route>

            <Route path="/payment/:planId" element={<Payment />} />
          </Route>
          <Route
            path="/order-invoice-preview"
            element={<OrderInvoicePreview />}
          />
        </Route>

        {publicRoutes.map((route, index) => renderRoute(route, index))}

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </>
  );
}

export default App;
