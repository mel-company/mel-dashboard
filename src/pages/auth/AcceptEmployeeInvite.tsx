import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  SettingsField,
  SettingsInput,
  SettingsPhoneInput,
} from "@/new-pages/settings/components/SettingsField";
import { employeeAPI } from "@/api/endpoints/employee.endpoints";
import { sanitizePhoneNumber } from "@/utils/helpers";
import { establishAuthSession } from "@/utils/auth-session";

function getErrorMessage(err: unknown, fallback: string): string {
  const message = (
    err as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  if (Array.isArray(message)) return message.join("، ");
  if (typeof message === "string") return message;
  return fallback;
}

type Step = "phone" | "otp";

const AcceptEmployeeInvite = () => {
  const { token = "" } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Awaited<
    ReturnType<typeof employeeAPI.previewInvite>
  > | null>(null);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setPreviewError("رابط الدعوة غير صالح");
        setLoading(false);
        return;
      }
      try {
        const data = await employeeAPI.previewInvite(token);
        if (!cancelled) setPreview(data);
      } catch (err) {
        if (!cancelled) {
          setPreviewError(getErrorMessage(err, "الدعوة غير صالحة أو منتهية"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const storeTitle = useMemo(
    () => preview?.store?.name || preview?.store?.domain || "المتجر",
    [preview],
  );

  const sendOtp = async () => {
    let canonicalPhone: string;
    try {
      canonicalPhone = sanitizePhoneNumber(phone, "+964");
    } catch {
      toast.error("رقم الهاتف غير صالح");
      return;
    }

    setBusy(true);
    try {
      await employeeAPI.requestInviteOtp({ token, phone: canonicalPhone });
      setPhone(canonicalPhone);
      setStep("otp");
      setCooldown(30);
      toast.success("تم إرسال رمز التحقق");
    } catch (err) {
      toast.error(getErrorMessage(err, "تعذر إرسال الرمز"));
    } finally {
      setBusy(false);
    }
  };

  const accept = async () => {
    if (!/^\d{4,6}$/.test(otp.trim())) {
      toast.error("أدخل رمز التحقق");
      return;
    }

    setBusy(true);
    try {
      const data = await employeeAPI.acceptInvite({
        token,
        phone,
        otp: otp.trim(),
      });
      establishAuthSession(data, queryClient);
      toast.success("تم قبول الدعوة — أهلاً بك");
      window.location.assign("/");
    } catch (err) {
      toast.error(getErrorMessage(err, "تعذر قبول الدعوة"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#070b1f]">
        <Loader2 className="size-6 animate-spin text-sky-600" />
      </div>
    );
  }

  if (previewError || !preview) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center dark:bg-[#070b1f]">
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {previewError || "الدعوة غير متاحة"}
        </p>
        <Button variant="brand-soft" onClick={() => navigate("/login")}>
          الذهاب لتسجيل الدخول
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-slate-50 px-4 py-10 dark:from-[#070b1f] dark:to-[#0a0e27]">
      <div className="w-full max-w-md space-y-5 rounded-[28px] bg-white p-6 shadow-sm dark:bg-[#0a0e27]">
        <div className="flex items-start gap-3 text-right">
          {preview.store.logo ? (
            <img
              src={preview.store.logo}
              alt=""
              className="size-12 rounded-xl object-contain"
            />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Mail className="size-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500">دعوة للانضمام إلى</p>
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#e4e7fc]">
              {storeTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#a4b1fa]">
              مرحباً {preview.name} — دورك: {preview.roleName}
            </p>
            <p className="mt-0.5 text-xs text-slate-400" dir="ltr">
              {preview.email}
            </p>
          </div>
        </div>

        {step === "phone" ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-slate-600 dark:text-[#a4b1fa]">
              أدخل رقم هاتفك لإكمال الدعوة. ستستخدمه لاحقاً لتسجيل الدخول عبر OTP.
            </p>
            <SettingsField label="رقم الهاتف" htmlFor="invite-phone">
              <SettingsPhoneInput
                id="invite-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </SettingsField>
            <Button
              type="button"
              variant="brand"
              className="h-12 w-full"
              disabled={busy}
              onClick={() => void sendOtp()}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              إرسال رمز التحقق
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-[#a4b1fa]">
              أدخل الرمز المرسل إلى{" "}
              <span dir="ltr" className="font-medium">
                {phone}
              </span>
            </p>
            <SettingsField label="رمز التحقق" htmlFor="invite-otp">
              <SettingsInput
                id="invite-otp"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                autoComplete="one-time-code"
                dir="ltr"
                className="text-center tracking-[0.35em]"
                placeholder="••••"
              />
            </SettingsField>
            <Button
              type="button"
              variant="brand"
              className="h-12 w-full"
              disabled={busy}
              onClick={() => void accept()}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              قبول الدعوة والدخول
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-full"
              disabled={busy || cooldown > 0}
              onClick={() => void sendOtp()}
            >
              {cooldown > 0 ? `إعادة الإرسال بعد ${cooldown}ث` : "إعادة إرسال الرمز"}
            </Button>
            <button
              type="button"
              className="w-full text-center text-xs text-slate-400 underline"
              onClick={() => {
                setStep("phone");
                setOtp("");
              }}
            >
              تغيير الرقم
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptEmployeeInvite;
