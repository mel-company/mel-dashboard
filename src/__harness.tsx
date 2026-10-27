import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import OrderDetailsSheet from "./new-pages/orders/components/OrderDetailsSheet";
const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const q = new URLSearchParams(location.hash.slice(1));
if (q.get("dark")) document.documentElement.classList.add("dark");
const seed = { id: "a1b2c3d4-0000", status: q.get("status") ?? "PENDING", createdAt: "2026-10-26T12:30:00Z", deliveryFee: 5000 };
createRoot(document.getElementById("root")!).render(
  <BrowserRouter><QueryClientProvider client={qc}>
    <OrderDetailsSheet order={seed} onOpenChange={() => {}} />
    <Toaster position="top-center" />
  </QueryClientProvider></BrowserRouter>,
);
