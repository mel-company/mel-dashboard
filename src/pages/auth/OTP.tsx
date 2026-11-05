import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  useResendOtp,
  useValidateUser,
  useVerify,
} from "@/api/wrappers/auth.wrappers";
import { establishAuthSession } from "@/utils/auth-session";
import { useQueryClient } from "@tanstack/react-query";
import { getTenantSubdomain } from "@/utils/tenant-subdomain";
import AuthShell from "./AuthShell";
import { cn } from "@/lib/utils";

type OtpLocationState = {
  v_code?: string;
};

const OTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const phone = searchParams.get("phone") ?? "";
  const storeParam = searchParams.get("store") ?? "";
  const locationCode = (location.state as OtpLocationState | null)?.v_code ?? "";

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { mutate: verify, isPending: isVerifyingPending } = useVerify();
  const { mutate: resendOtp, isPending: isResendingOtp } = useResendOtp();
  const { mutate: validateUser } = useValidateUser();

  const tenantSubdomain = getTenantSubdomain();
  const normalizedStoreParam = storeParam.startsWith("dash.")
    ? storeParam.slice("dash.".length)
    : storeParam;
  const store = normalizedStoreParam || tenantSubdomain;
  const isAzyaaHost = window.location.hostname === "azyaa.mel.iq";
  const defaultFallbackUrl =
    import.meta.env.VITE_STORE_AUTH_FALLBACK_URL || "https://mel-iq.vercel.app/";

  const maskedPhone = useMemo(() => {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return "";
    const tail = digits.slice(-3);
    return `${digits
      .slice(0, Math.max(0, digits.length - 3))
      .replace(/\d/g, "•")}${tail}`;
  }, [phone]);

  // Strip legacy ?code= from the address bar if present
  useEffect(() => {
    if (!searchParams.has("code")) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("code");
        return next;
      },
      { replace: true },
    );
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    if ((tenantSubdomain === "fashion" || isAzyaaHost) && locationCode) {
      setCode(locationCode.toString());
    }
  }, [tenantSubdomain, isAzyaaHost, locationCode]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 4) {
      toast.error("يرجى إدخال رمز مكوّن من 4 أرقام");
      return;
    }

    setIsVerifying(true);
    verify(
      {
        phone: phone,
        code: code,
        store: {
          name: store,
          domain: store,
        },
      },
      {
        onSuccess: (verifyData: any) => {
          const verifyToken =
            verifyData?.token || verifyData?.jwt || verifyData?.accessToken;
          const verifyRedirect = verifyData?.redirectUrl;
          const fallbackUrl = verifyData?.fallbackUrl || defaultFallbackUrl;

          if (verifyRedirect) {
            establishAuthSession(verifyData, queryClient);
            window.location.assign(verifyRedirect);
            return;
          }

          if (!verifyToken || !store) {
            establishAuthSession(verifyData, queryClient);
            window.location.assign(fallbackUrl);
            return;
          }

          validateUser(
            {
              store,
              token: verifyToken,
            },
            {
              onSuccess: (validateData: any) => {
                establishAuthSession(
                  { ...verifyData, ...validateData },
                  queryClient,
                );
                const redirectUrl = validateData?.redirectUrl;
                if (redirectUrl) {
                  window.location.assign(redirectUrl);
                  return;
                }
                window.location.assign(fallbackUrl);
              },
              onError: () => {
                establishAuthSession(verifyData, queryClient);
                window.location.assign(fallbackUrl);
              },
            },
          );
        },
        onError: (error: any) => {
          localStorage.setItem("lgd", "false");
          toast.error(
            error?.response?.data?.message ||
              "فشل تحقق الرمز. يرجى المحاولة مرة أخرى",
          );
        },
        onSettled: () => setIsVerifying(false),
      },
    );
  };

  const handleResend = () => {
    if (cooldown > 0 || !phone || !store) return;
    resendOtp(
      {
        phone,
        store: { name: store, domain: store },
      },
      {
        onSuccess: (data) => {
          setCooldown(30);
          toast.success("تمت إعادة إرسال رمز التحقق");
          if ((locationCode || isAzyaaHost) && data?.codeOnlyOnDev != null) {
            setCode(String(data.codeOnlyOnDev));
          }
        },
        onError: () => {
          toast.error("فشل إعادة إرسال الرمز. يرجى المحاولة مرة أخرى");
        },
      },
    );
  };

  const busy = isVerifying || isVerifyingPending;

  return (
    <AuthShell
      title="رمز التحقق"
      description={
        <>
          أدخل الرمز المكوّن من 4 أرقام
          {maskedPhone ? (
            <>
              {" "}
              المرسل إلى{" "}
              <span dir="ltr" className="font-semibold text-[#33c5ff]">
                {maskedPhone}
              </span>
            </>
          ) : null}
        </>
      }
    >
      <form onSubmit={handleVerify} className="space-y-6">
        <div className="flex justify-center py-1" dir="ltr">
          <InputOTP
            maxLength={4}
            value={code}
            onChange={(v) =>
              setCode(
                v
                  .replace(/[٠-٩]/g, (d) =>
                    String(d.charCodeAt(0) - 0x0660),
                  )
                  .replace(/[۰-۹]/g, (d) =>
                    String(d.charCodeAt(0) - 0x06f0),
                  )
                  .replace(/\D/g, "")
                  .slice(0, 4),
              )
            }
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            aria-label="رمز التحقق"
            containerClassName="justify-center"
          >
            <InputOTPGroup className="gap-3 sm:gap-3.5">
              {[0, 1, 2, 3].map((index) => {
                const filled = Boolean(code[index]);
                return (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className={cn(
                      // Independent tiles — override the joined UI-kit strip.
                      "!h-16 !w-14 !rounded-2xl !border-2 border-solid !shadow-none first:!rounded-2xl last:!rounded-2xl first:!border-l-2",
                      "!text-2xl font-bold tabular-nums",
                      filled
                        ? "border-[#00b7ff]/45 bg-[#00b7ff]/10 text-slate-900 dark:border-[#00b7ff]/40 dark:bg-[#00b7ff]/12 dark:text-white"
                        : "border-slate-200 bg-white text-slate-900 dark:border-white/12 dark:bg-[#12183b] dark:text-white",
                      "data-[active=true]:!z-10 data-[active=true]:!border-[#00b7ff] data-[active=true]:!bg-[#00b7ff]/15 data-[active=true]:!ring-[3px] data-[active=true]:!ring-[#00b7ff]/30",
                      "transition-[border-color,box-shadow,background-color,transform] duration-200",
                      "sm:!h-[4.25rem] sm:!w-[3.75rem] sm:!text-[1.75rem]",
                    )}
                  />
                );
              })}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          type="submit"
          disabled={busy || code.length !== 4}
          className="h-12 w-full gap-2 rounded-2xl bg-[#00b7ff] text-base font-bold text-[#06091a] shadow-[0_12px_40px_-12px_rgba(0,183,255,0.55)] transition hover:bg-[#33c5ff] hover:text-[#06091a] disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              جاري التحقق…
            </>
          ) : (
            "تأكيد الرمز"
          )}
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResend}
            disabled={cooldown > 0 || isResendingOtp || !phone || !store}
            className="h-11 rounded-2xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-[#a4b1fa] dark:hover:bg-white/5 dark:hover:text-white"
          >
            {isResendingOtp
              ? "جاري الإرسال…"
              : cooldown > 0
                ? `إعادة الإرسال خلال ${cooldown}ث`
                : "إعادة إرسال الرمز"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/login")}
            className="h-11 gap-2 rounded-2xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-[#a4b1fa] dark:hover:bg-white/5 dark:hover:text-white"
          >
            <ArrowRight className="size-4" />
            تعديل الرقم
          </Button>
        </div>
      </form>
    </AuthShell>
  );
};

export default OTP;
