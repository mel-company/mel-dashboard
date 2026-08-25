import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useStorePlatformPaymentStatus } from "@/api/wrappers/platform-payment.wrapper";
import { subscriptionKeys } from "@/api/wrappers/subscription.wrapper";

export default function PaymentReturn() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const paymentId = params.get("paymentId");
  const result = params.get("result");

  const { data, isLoading, isError } = useStorePlatformPaymentStatus(
    paymentId,
    !!paymentId,
  );

  const status = data?.status as string | undefined;

  useEffect(() => {
    if (!paymentId) {
      toast.error("معرف الدفع مفقود");
      navigate("/settings/store", { replace: true });
      return;
    }

    if (result === "failure" || status === "FAILED" || status === "EXPIRED") {
      toast.error("فشلت عملية الدفع. حاول مرة أخرى.");
      navigate("/settings/store", { replace: true });
      return;
    }

    if (status === "PAID") {
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.detail("store"),
      });
      toast.success("تم الدفع بنجاح وتم تحديث الاشتراك");
      navigate("/settings/store", { replace: true });
    }
  }, [paymentId, result, status, navigate, queryClient]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="size-10 animate-spin text-muted-foreground" />
      <p className="text-muted-foreground">
        {isLoading || status === "PENDING"
          ? "جاري التحقق من الدفع..."
          : isError
            ? "تعذر التحقق من الدفع"
            : "جاري المتابعة..."}
      </p>
    </div>
  );
}
