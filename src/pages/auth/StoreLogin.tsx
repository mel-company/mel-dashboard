import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Store, UserPlus } from "lucide-react";
import { getTenantSubdomain } from "@/utils/tenant-subdomain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFetchDevStores } from "@/api/wrappers/store.wrappers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLogin } from "@/api/wrappers/auth.wrappers";
import { employeeAPI } from "@/api/endpoints/employee.endpoints";
import { cn } from "@/lib/utils";
import AuthShell from "./AuthShell";

const IRAQ_CODE = "964";
const LOCAL_PHONE_LENGTH = 10;

/** Eastern / Arabic-Indic digits → Western 0-9. */
const toWesternDigits = (value: string) =>
  value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

/**
 * Local Iraq mobile only: Western digits, max 10, no leading zero.
 * Arabic keypad input is converted on the fly.
 */
const sanitizeLocalPhone = (raw: string) => {
  let digits = toWesternDigits(raw).replace(/\D/g, "");
  // Pasted full international → keep the local tail.
  if (digits.startsWith(IRAQ_CODE) && digits.length > LOCAL_PHONE_LENGTH) {
    digits = digits.slice(IRAQ_CODE.length);
  }
  digits = digits.replace(/^0+/, "");
  return digits.slice(0, LOCAL_PHONE_LENGTH);
};

const fieldClass = cn(
  "h-12 rounded-2xl focus-visible:border-[#00b7ff]/50 focus-visible:ring-[#00b7ff]/25",
  "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
  "dark:border-white/10 dark:bg-[#12183b] dark:text-[#e4e7fc] dark:placeholder:text-[#4a5596]",
);

const StoreLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [mode, setMode] = useState<"login" | "join">("login");
  const [joinName, setJoinName] = useState("");
  const [joinEmail, setJoinEmail] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinSent, setJoinSent] = useState(false);

  const isLoggedIn = localStorage.getItem("lgd") === "true";
  const isProduction = import.meta.env.VITE_ENVIRONMENT === "production";
  const subdomain = getTenantSubdomain();
  const isAzyaaHost = window.location.hostname === "azyaa.mel.iq";

  const { data: stores, isLoading: isLoadingStores } = useFetchDevStores();
  const { mutate: login, isPending: isLoginPending } = useLogin();

  const selectedStore = useMemo(() => {
    const list = stores?.data ?? [];
    return list.find((store: any) => String(store.id) === selectedStoreId);
  }, [stores?.data, selectedStoreId]);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
      return;
    }

    if (subdomain === "azyaa") {
      setSelectedStoreId("eba098bb-4686-4adb-ba2f-22a92f0507b4");
      setPhone("7717504243");
    }
    if (isAzyaaHost) {
      setPhone("7717504243");
    }
  }, [subdomain, isAzyaaHost, isLoggedIn, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const local = sanitizeLocalPhone(phone);

    if (!local) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }

    if (local.length !== LOCAL_PHONE_LENGTH) {
      toast.error(`رقم الهاتف يجب أن يكون ${LOCAL_PHONE_LENGTH} أرقام`);
      return;
    }

    if (!subdomain && !selectedStoreId) {
      toast.error("يرجى اختيار المتجر");
      return;
    }
    if (!isProduction && !selectedStore && !subdomain) {
      toast.error("لم يتم العثور على المتجر المختار");
      return;
    }

    const normalized = `+${IRAQ_CODE}${local}`;

    const storeDomain =
      subdomain === "azyaa" || isAzyaaHost
        ? subdomain || "azyaa"
        : selectedStore?.domain || subdomain || null;
    const storeName =
      subdomain === "azyaa" || isAzyaaHost
        ? subdomain || "azyaa"
        : selectedStore?.name || subdomain || null;

    setIsLoading(true);
    login(
      {
        phone: normalized,
        store: {
          name: storeName,
          domain: storeDomain,
        },
      },
      {
        onSuccess: (data) => {
          const storeParam = storeDomain || selectedStore?.domain || "";
          const url = `/otp?phone=${encodeURIComponent(normalized)}&store=${encodeURIComponent(storeParam)}`;

          navigate(url, {
            state: data?.codeOnlyOnDev
              ? { v_code: String(data.codeOnlyOnDev) }
              : undefined,
          });
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى",
          );
        },
        onSettled: () => setIsLoading(false),
      },
    );
  };

  const busy = isLoading || isLoginPending;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = joinName.trim();
    const email = joinEmail.trim().toLowerCase();
    if (name.length < 2) {
      toast.error("أدخل اسمك");
      return;
    }
    if (!email.includes("@")) {
      toast.error("أدخل بريداً صالحاً");
      return;
    }
    const storeDomain =
      subdomain || selectedStore?.domain?.trim()?.toLowerCase() || "";
    if (!storeDomain) {
      toast.error("تعذر تحديد المتجر");
      return;
    }

    setJoinBusy(true);
    try {
      const res = await employeeAPI.createJoinRequest({
        name,
        email,
        storeDomain,
        ...(joinMessage.trim() ? { message: joinMessage.trim() } : {}),
      });
      setJoinSent(true);
      toast.success(res.message || "تم إرسال طلب الانضمام");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "تعذر إرسال طلب الانضمام",
      );
    } finally {
      setJoinBusy(false);
    }
  };

  return (
    <AuthShell
      title={mode === "join" ? "طلب انضمام" : "أهلاً بك"}
      description={
        mode === "join"
          ? "أرسل طلبك لمالك المتجر — بعد الموافقة يصلك إيميل بدعوة الدخول."
          : "أدخل رقم هاتفك وسنرسل رمز تحقق مكوّن من 4 أرقام للدخول إلى لوحة المتجر."
      }
    >
      {mode === "join" ? (
        joinSent ? (
          <div className="space-y-4 text-center">
            <p className="rounded-2xl bg-emerald-50 px-4 py-4 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              تم إرسال طلبك. راقب إيميلك بعد موافقة المالك لرابط الدخول.
            </p>
            <Button
              type="button"
              variant="brand-soft"
              className="h-11 w-full"
              onClick={() => {
                setMode("login");
                setJoinSent(false);
              }}
            >
              العودة لتسجيل الدخول
            </Button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleJoin(e)} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-right text-[13px] font-medium text-slate-500 dark:text-[#a4b1fa]">
                الاسم
              </label>
              <Input
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="مثلاً: أحمد علي"
                className={cn(fieldClass, "px-4")}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-right text-[13px] font-medium text-slate-500 dark:text-[#a4b1fa]">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                value={joinEmail}
                onChange={(e) => setJoinEmail(e.target.value)}
                placeholder="name@example.com"
                dir="ltr"
                className={cn(fieldClass, "px-4 text-left")}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-right text-[13px] font-medium text-slate-500 dark:text-[#a4b1fa]">
                ملاحظة (اختياري)
              </label>
              <textarea
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                rows={3}
                maxLength={280}
                placeholder="لماذا تريد الانضمام؟"
                className={cn(
                  fieldClass,
                  "h-auto min-h-[88px] w-full resize-none px-4 py-3 text-sm",
                )}
              />
            </div>
            <Button
              type="submit"
              disabled={joinBusy}
              className="h-12 w-full gap-2 rounded-2xl bg-[#00b7ff] text-base font-bold text-[#06091a] hover:bg-[#33c5ff]"
            >
              {joinBusy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              إرسال طلب الانضمام
            </Button>
            <button
              type="button"
              className="w-full text-center text-sm text-slate-500 underline dark:text-[#a4b1fa]"
              onClick={() => setMode("login")}
            >
              لدي حساب — تسجيل الدخول
            </button>
          </form>
        )
      ) : (
      <form onSubmit={handleSubmit} className="space-y-5">
        {!isProduction ? (
          isLoadingStores ? (
            <div className="flex h-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-[#12183b]">
              <Loader2 className="size-5 animate-spin text-[#00b7ff]" />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-right text-[13px] font-medium text-slate-500 dark:text-[#a4b1fa]">
                المتجر (تطوير)
              </label>
              <Select
                value={selectedStoreId}
                onValueChange={setSelectedStoreId}
              >
                <SelectTrigger
                  className={cn(fieldClass, "w-full justify-between px-4")}
                >
                  <SelectValue placeholder="اختر المتجر" />
                  <Store className="size-4 text-[#00b7ff]" />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-[#12183b] dark:text-[#e4e7fc]">
                  {stores?.data?.map((store: any) => (
                    <SelectItem key={store.id} value={String(store.id)}>
                      {store.name} — {store.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="block text-right text-[13px] font-medium text-slate-500 dark:text-[#a4b1fa]"
          >
            رقم الهاتف
          </label>
          <div className="flex items-stretch gap-2" dir="ltr">
            <span
              className={cn(
                fieldClass,
                "inline-flex min-w-[4.75rem] shrink-0 items-center justify-center px-3 text-[13px] font-semibold tabular-nums text-slate-600 dark:text-[#a4b1fa]",
              )}
              aria-hidden
            >
              +{IRAQ_CODE}
            </span>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={LOCAL_PHONE_LENGTH}
              placeholder="7XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(sanitizeLocalPhone(e.target.value))}
              className={cn(fieldClass, "min-w-0 flex-1 px-4 text-left")}
              dir="ltr"
              autoComplete="tel-national"
              required
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-[#4a5596]">
            <span>أرقام إنجليزية فقط — بدون صفر في البداية</span>
            <span dir="ltr">
              {phone.length}/{LOCAL_PHONE_LENGTH}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={busy || phone.length !== LOCAL_PHONE_LENGTH}
          className="h-12 w-full gap-2 rounded-2xl bg-[#00b7ff] text-base font-bold text-[#06091a] shadow-[0_12px_40px_-12px_rgba(0,183,255,0.55)] transition hover:bg-[#33c5ff] hover:text-[#06091a] disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              جاري الإرسال…
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" />
              إرسال رمز التحقق
            </>
          )}
        </Button>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-[#e4e7fc] dark:hover:bg-white/5"
          onClick={() => setMode("join")}
        >
          <UserPlus className="size-4 text-[#00b7ff]" />
          طلب انضمام للمتجر
        </button>
      </form>
      )}
    </AuthShell>
  );
};

export default StoreLogin;
