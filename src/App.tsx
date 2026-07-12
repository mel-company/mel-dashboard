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
import { markAuthSession } from "./utils/auth-session";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <NotFoundPage /> : <Navigate to="/login" replace />;
}

function Bridge() {
  const { mutate: consumeBridge } = useConsumeBridge();
  const queryClient = useQueryClient();

  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    if (token) {
      consumeBridge(
        { token },
        {
          onSuccess: () => {
            markAuthSession(queryClient);
            window.location.href = "/";
          },
          onError: (error) => {
            console.error(error);
          },
        },
      );
    }
  }, [token]);

  return <div>Bridge</div>;
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
