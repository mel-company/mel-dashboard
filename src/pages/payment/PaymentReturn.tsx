import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useStorePlatformPaymentStatus } from "@/api/wrappers/platform-payment.wrapper";
import { subscriptionKeys } from "@/api/wrappers/subscription.wrapper";
import { domainAPI } from "@/api/endpoints/domain.endpoints";
import { domainKeys } from "@/api/wrappers/domain.wrappers";
import {
  DOMAIN_PURCHASE_RETURN_KEY,
  LAST_PAYMENT_ID_KEY,
} from "@/new-pages/settings/components/DomainSettingsSection";

/**
 * Registration writes `store.customDomain` but stops there — it never creates
 * the Cloudflare Custom Hostnames, and the status endpoint only ever looks
 * existing ones up. Attaching once on return is what provisions apex and www,
 * so the DNS/SSL panel has something to report.
 */
const provisionPurchasedDomain = async (): Promise<boolean> => {
  const raw = sessionStorage.getItem(DOMAIN_PURCHASE_RETURN_KEY);
  // Gone if the gateway came back in a fresh tab — the domain is registered,
  // it just has no Cloudflare hostnames yet.
  if (!raw) return false;

  try {
    const { domain } = JSON.parse(raw) as { domain?: string };
    if (!domain) return false;
    await domainAPI.setCustomDomain(domain);
    return true;
  } catch {
    return false;
  } finally {
    sessionStorage.removeItem(DOMAIN_PURCHASE_RETURN_KEY);
  }
};

export default function PaymentReturn() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const paymentIdFromQuery = params.get("paymentId");
  const paymentIdFromStorage =
    typeof window !== "undefined"
      ? sessionStorage.getItem(LAST_PAYMENT_ID_KEY)
      : null;
  const paymentId = paymentIdFromQuery || paymentIdFromStorage;
  const result = params.get("result");

  const { data, isLoading, isError } = useStorePlatformPaymentStatus(
    paymentId,
    !!paymentId,
  );

  const status = data?.status as string | undefined;
  const type = data?.type as string | undefined;
  const settled = useRef(false);

  useEffect(() => {
    if (settled.current) return;

    if (!paymentId) {
      settled.current = true;
      toast.error("معرف الدفع مفقود");
      navigate("/settings/store", { replace: true });
      return;
    }

    if (result === "failure" || status === "FAILED" || status === "EXPIRED") {
      settled.current = true;
      toast.error("فشلت عملية الدفع. حاول مرة أخرى.");
      sessionStorage.removeItem(LAST_PAYMENT_ID_KEY);
      sessionStorage.removeItem(DOMAIN_PURCHASE_RETURN_KEY);
      navigate("/settings/store", { replace: true });
      return;
    }

    if (status !== "PAID") return;

    settled.current = true;
    sessionStorage.removeItem(LAST_PAYMENT_ID_KEY);

    if (type === "DOMAIN_REGISTRATION") {
      void provisionPurchasedDomain().then((linked) => {
        queryClient.invalidateQueries({ queryKey: domainKeys.all });
        if (linked) {
          toast.success("تم شراء الدومين وربطه بالمتجر");
        } else {
          toast.warning("تم شراء الدومين — أكمل ربطه من إعدادات النطاق");
        }
        navigate("/settings/store", { replace: true });
      });
      return;
    }

    queryClient.invalidateQueries({
      queryKey: subscriptionKeys.detail("store"),
    });
    toast.success("تم الدفع بنجاح وتم تحديث الاشتراك");
    navigate("/settings/store", { replace: true });
  }, [paymentId, result, status, type, navigate, queryClient]);

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
