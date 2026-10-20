import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * What an order's detail shows once the subscription has ended. The server
 * refuses the detail (402 `SUBSCRIPTION_EXPIRED`); the store keeps taking
 * orders, and renewing opens them all again.
 */
export function OrderDetailsLocked({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  return (
    <div
      dir="rtl"
      className={
        compact
          ? "flex flex-col items-center gap-4 px-6 py-12 text-center"
          : "flex min-h-[50vh] flex-col items-center justify-center gap-5 px-6 py-16 text-center"
      }
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-red-500/10 text-red-600">
        <Lock className="size-7" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          تفاصيل الطلبات مقفلة
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          انتهى اشتراكك. متجرك ما زال يستقبل الطلبات، جدّد اشتراكك لعرض
          تفاصيلها ومتابعتها.
        </p>
      </div>
      <Button
        size="lg"
        className="rounded-full px-6"
        onClick={() => navigate("/settings/store")}
      >
        تجديد الاشتراك
      </Button>
    </div>
  );
}

export default OrderDetailsLocked;
