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
import PaymentReturn from "./pages/payment/PaymentReturn";
import { useConsumeBridge } from "./api/wrappers/auth.wrappers";
import { establishAuthSession } from "./utils/auth-session";
import AuthLoadingScreen from "./components/AuthLoadingScreen";
import EditorSplash from "./components/EditorSplash";
import { useResolvedTheme } from "./hooks/use-resolved-theme";
import { useEffect } from "react";
import { resolveBridgeNext } from "./utils/bridge-next";
import { useQueryClient } from "@tanstack/react-query";
import { ImageEditorHost } from "./components/image-editor/ImageEditorHost";

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <NotFoundPage /> : <Navigate to="/login" replace />;
}

function Bridge() {
  const { mutate: consumeBridge } = useConsumeBridge();
  const queryClient = useQueryClient();
  const theme = useResolvedTheme();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  // Landing may put `generation` on `/bridge` or inside `next` — both must
  // reach `/editor?generation=` so the iframe handoff can overwrite pages.
  const next = resolveBridgeNext(
    params.get("next"),
    params.get("generation"),
  );

  useEffect(() => {
    if (!token) {
      window.location.replace("/login");
      return;
    }

    consumeBridge(
      { token },
      {
        onSuccess: (data) => {
          establishAuthSession(data, queryClient);
          window.location.replace(next);
        },
        onError: () => {
          window.location.replace("/login");
        },
      },
    );
  }, [token, next, consumeBridge, queryClient]);

  // The landing page's hand-off straight into the editor gets the editor's
  // splash from the first frame rather than a different loader before it.
  if (new URL(next, window.location.origin).pathname === "/editor") {
    return <EditorSplash theme={theme} className="min-h-screen" />;
  }

  return <AuthLoadingScreen message="جاري تسجيل الدخول..." />;
}

function App() {
  return (
    <>
      <Toaster />
      {/* One image-editor modal for every image input; see withImageEditor. */}
      <ImageEditorHost />
      <Routes>
        <Route path="/bridge" element={<Bridge />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            {mainRoutes.map((route, index) => renderRoute(route, index))}

            <Route path="/settings" element={<SettingsLayout />}>
              {settingsRoutes.map((route, index) => renderRoute(route, index))}
            </Route>

            <Route path="/payment/:planId" element={<Payment />} />
            <Route path="/payment/return" element={<PaymentReturn />} />
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
