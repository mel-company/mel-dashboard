import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { employeeAPI } from "@/api/endpoints/employee.endpoints";
import { establishAuthSession } from "@/utils/auth-session";

function getErrorMessage(err: unknown, fallback: string): string {
  const message = (
    err as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  if (Array.isArray(message)) return message.join("، ");
  if (typeof message === "string") return message;
  return fallback;
}

/** Email link → one tap into the dashboard. No phone / OTP. */
const AcceptEmployeeInvite = () => {
  const { token = "" } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Awaited<
    ReturnType<typeof employeeAPI.previewInvite>
  > | null>(null);
  const [busy, setBusy] = useState(false);

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

  const storeTitle = useMemo(
    () => preview?.store?.name || preview?.store?.domain || "المتجر",
    [preview],
  );

  const accept = async () => {
    setBusy(true);
    try {
      const data = await employeeAPI.acceptInvite({ token });
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

        <p className="text-sm leading-relaxed text-slate-600 dark:text-[#a4b1fa]">
          اضغط الزر للدخول مباشرة إلى لوحة التحكم — بدون رمز تحقق.
        </p>

        <Button
          type="button"
          variant="brand"
          className="h-12 w-full gap-2"
          disabled={busy}
          onClick={() => void accept()}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          قبول الدعوة والدخول
        </Button>
      </div>
    </div>
  );
};

export default AcceptEmployeeInvite;
