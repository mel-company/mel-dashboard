import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ChevronDown,
  Loader2,
  Search,
  ShieldCheck,
  Store,
} from "lucide-react";
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
import {
  useFetchAllCursor,
  useSearchCursor,
} from "@/api/wrappers/country.wrappers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import AuthShell from "./AuthShell";

const normalizePhone = (value: string) => value.replace(/[^\d+]/g, "");

const isValidPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debouncedValue;
}

type CountryOption = {
  id: string;
  name?: { ar?: string; en?: string };
  phoneCode?: string | null;
  code2?: string | null;
};

const getCountryLabel = (c: CountryOption) => {
  const name = c.name?.ar || c.name?.en || "";
  const code = c.phoneCode ? `+${String(c.phoneCode).replace(/^\+/, "")}` : "";
  return code ? `${name} (${code})` : name || "—";
};

const DEFAULT_COUNTRY_IRAQ: CountryOption = {
  id: "5407d29b-741e-430e-9b9b-9f0c86841d9d",
  name: { ar: "العراق", en: "Iraq" },
  phoneCode: "+964",
  code2: "IQ",
};

const PAGE_SIZE = 10;

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

  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(
    DEFAULT_COUNTRY_IRAQ,
  );
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebouncedValue(countrySearchQuery.trim(), 350);

  const {
    data: countriesAllData,
    isLoading: isLoadingCountriesAll,
    fetchNextPage: fetchNextCountriesAll,
    hasNextPage: hasNextCountriesAll,
    isFetchingNextPage: isFetchingNextCountriesAll,
  } = useFetchAllCursor({ limit: PAGE_SIZE }, countryOpen && !debouncedSearch);

  const {
    data: countriesSearchData,
    isLoading: isLoadingCountriesSearch,
    fetchNextPage: fetchNextCountriesSearch,
    hasNextPage: hasNextCountriesSearch,
    isFetchingNextPage: isFetchingNextCountriesSearch,
  } = useSearchCursor(
    { query: debouncedSearch, limit: PAGE_SIZE },
    countryOpen && !!debouncedSearch,
  );

  const isSearchMode = !!debouncedSearch;
  const countriesData = isSearchMode ? countriesSearchData : countriesAllData;
  const countries = countriesData?.pages?.flatMap((p) => p.data ?? []) ?? [];
  const hasNextPage = isSearchMode
    ? hasNextCountriesSearch
    : hasNextCountriesAll;
  const fetchNextPage = isSearchMode
    ? fetchNextCountriesSearch
    : fetchNextCountriesAll;
  const isFetchingNextPage = isSearchMode
    ? isFetchingNextCountriesSearch
    : isFetchingNextCountriesAll;
  const isLoadingCountries = isSearchMode
    ? isLoadingCountriesSearch
    : isLoadingCountriesAll;

  const loadMoreCallback = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = loadMoreRef.current;
    const root = scrollContainerRef.current;
    if (!el || !root || !countryOpen || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMoreCallback();
      },
      { root, rootMargin: "80px", threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [countryOpen, hasNextPage, loadMoreCallback, countries.length]);

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

  const phoneDigitsCount = useMemo(
    () => phone.replace(/\D/g, "").length,
    [phone],
  );

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
      return;
    }

    if (subdomain === "azyaa") {
      setSelectedStoreId("eba098bb-4686-4adb-ba2f-22a92f0507b4");
      setPhone("+9647717504243");
    }
    if (isAzyaaHost) {
      setPhone("+9647717504243");
    }
  }, [subdomain, isAzyaaHost, isLoggedIn, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
    const countryCodeDigits = selectedCountry?.phoneCode
      ? String(selectedCountry.phoneCode).replace(/\D/g, "")
      : "";
    const fullPhone =
      selectedCountry?.phoneCode && countryCodeDigits
        ? digits.startsWith(countryCodeDigits)
          ? `+${digits}`
          : `+${countryCodeDigits}${digits}`
        : phone;

    const normalized = normalizePhone(fullPhone);

    if (!normalized) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }

    if (!selectedCountry) {
      toast.error("يرجى اختيار الدولة");
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

    if (!isValidPhone(normalized)) {
      toast.error("يرجى إدخال رقم هاتف صحيح");
      return;
    }

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
            <DropdownMenu open={countryOpen} onOpenChange={setCountryOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    fieldClass,
                    "min-w-[5.5rem] shrink-0 justify-between gap-1 px-3 hover:bg-slate-100 dark:hover:bg-[#1a224c] dark:hover:text-[#e4e7fc]",
                  )}
                >
                  <span className="truncate text-[13px] tabular-nums">
                    {selectedCountry?.phoneCode
                      ? `+${String(selectedCountry.phoneCode).replace(/^\+/, "")}`
                      : "—"}
                  </span>
                  <ChevronDown className="size-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[min(100vw-2rem,280px)] border-slate-200 bg-white p-0 text-slate-900 dark:border-white/10 dark:bg-[#0a0e27] dark:text-[#e4e7fc]"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <div className="border-b border-slate-100 p-2 dark:border-white/8">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-[#4a5596]" />
                    <Input
                      placeholder="بحث عن دولة"
                      value={countrySearchQuery}
                      onChange={(e) => setCountrySearchQuery(e.target.value)}
                      className="h-9 border-slate-200 bg-slate-50 pl-8 pr-3 text-right text-slate-900 placeholder:text-slate-400 dark:border-white/10 dark:bg-[#12183b] dark:text-[#e4e7fc] dark:placeholder:text-[#4a5596]"
                      dir="auto"
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div
                  ref={scrollContainerRef}
                  className="max-h-[220px] overflow-y-auto"
                >
                  {isLoadingCountries ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="size-5 animate-spin text-[#00b7ff]" />
                    </div>
                  ) : countries.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-500 dark:text-[#a4b1fa]">
                      لا توجد نتائج
                    </div>
                  ) : (
                    countries.map((c: CountryOption) => (
                      <button
                        key={c.id}
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-right text-sm transition-colors hover:bg-slate-50 dark:hover:bg-white/5",
                          selectedCountry?.id === c.id &&
                            "bg-[#00b7ff]/10 text-[#0090c9] dark:text-[#33c5ff]",
                        )}
                        onClick={() => {
                          setSelectedCountry(c);
                          setCountryOpen(false);
                          setCountrySearchQuery("");
                        }}
                      >
                        <span className="truncate">{getCountryLabel(c)}</span>
                      </button>
                    ))
                  )}
                  {hasNextPage ? (
                    <div ref={loadMoreRef} className="flex justify-center py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="gap-2 text-slate-500 hover:text-slate-900 dark:text-[#a4b1fa] dark:hover:text-white"
                      >
                        {isFetchingNextPage ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            جاري التحميل…
                          </>
                        ) : (
                          "تحميل المزيد"
                        )}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="7XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(normalizePhone(e.target.value))}
              className={cn(fieldClass, "min-w-0 flex-1 px-4 text-left")}
              dir="ltr"
              autoComplete="tel"
              required
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-[#4a5596]">
            <span>بدون مسافات أو أصفار بادئة</span>
            <span dir="ltr">{phoneDigitsCount} رقم</span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={busy}
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
