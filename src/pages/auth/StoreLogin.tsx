import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Store } from "lucide-react";
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

  return (
    <AuthShell
      title="أهلاً بك"
      description="أدخل رقم هاتفك وسنرسل رمز تحقق مكوّن من 4 أرقام للدخول إلى لوحة المتجر."
    >
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
      </form>
    </AuthShell>
  );
};

export default StoreLogin;
