import { Lock, LifeBuoy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * Full-page gate once the store is FROZEN (7+ days past end_at).
 * Only renew / pay and support remain open on the server.
 */
export function SubscriptionFrozenScreen() {
  const navigate = useNavigate();

  return (
    <div
      dir="rtl"
      className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-16 text-center"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-[#e11d48]/10 text-[#e11d48]">
        <Lock className="size-7" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          المتجر مجمّد مؤقتاً
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          انتهى اشتراكك منذ أكثر من 7 أيام. جدّد الاشتراك لإعادة فتح لوحة التحكم،
          أو راسل الدعم إذا احتجت مساعدة.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          size="lg"
          className="rounded-full bg-[#00b7ff] px-6 font-bold text-white hover:bg-[#00a3e6]"
          onClick={() => navigate("/subscription")}
        >
          تجديد الاشتراك
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="rounded-full px-6"
          onClick={() => navigate("/tickets/new")}
        >
          <LifeBuoy className="size-4" />
          تذكرة دعم
        </Button>
      </div>
    </div>
  );
}

export default SubscriptionFrozenScreen;
