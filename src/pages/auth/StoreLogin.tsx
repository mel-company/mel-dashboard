import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Phone, ArrowLeft, ShieldCheck, Store } from "lucide-react";
import { parse } from "tldts";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFetchDevStores } from "@/api/wrappers/store.wrappers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLogin } from "@/api/wrappers/auth.wrappers";

const normalizePhone = (value: string) => value.replace(/[^\d+]/g, "");

const isValidPhone = (phone: string) => {
  // very permissive: allow +country and 10-15 digits total
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
};

const StoreLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");

  const isProduction = import.meta.env.VITE_ENVIRONMENT === "production";

  const parsed = parse(window.location.hostname);
  const subdomain = parsed.subdomain;

  const { data: stores, isLoading: isLoadingStores } = useFetchDevStores();

  const { mutate: login, isPending: isLoginPending } = useLogin();

  // const selectedStore = useMemo(() => {
  //   const list = stores?.data ?? [];
  //   return list.find((store: any) => String(store.id) === selectedStoreId);
  // }, [stores?.data, selectedStoreId]);

  const phoneDigitsCount = useMemo(
    () => phone.replace(/\D/g, "").length,
    [phone]
  );

  useEffect(() => {
    if (subdomain === "fashion") {
      setSelectedStoreId("eba098bb-4686-4adb-ba2f-22a92f0507b4");
      setPhone("+9647717504243");
    }
  }, [subdomain, stores?.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(phone);

    if (!normalized) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }

    if (!selectedStoreId) {
      toast.error("يرجى اختيار المتجر");
      return;
    }
    // if (!selectedStore) {
    //   toast.error("لم يتم العثور على المتجر المختار");
    //   return;
    // }

    if (!isValidPhone(normalized)) {
      toast.error("يرجى إدخال رقم هاتف صحيح");
      return;
    }

    setIsLoading(true);
    try {
      login(
        {
          phone: normalized,
          store: {
            name: parsed.subdomain === "fashion" ? "fashion" : null,
            domain: parsed.subdomain === "fashion" ? "fashion" : null,
          },
        },
        {
          onSuccess: (data) => {
            let url =
              subdomain === "fashion"
                ? `/otp?phone=${encodeURIComponent(normalized)}&store=${
                    parsed.subdomain === "fashion" ? "fashion" : null
                  }&code=${data?.codeOnlyOnDev}`
                : `/otp?phone=${encodeURIComponent(normalized)}&store=${
                    parsed.subdomain === "fashion" ? "fashion" : null
                  }`;

            navigate(url);
            // navigate(
            //   `/otp?phone=${encodeURIComponent(normalized)}&store=${
            //     selectedStore.domain
            //   }`,
            //   {
            //     state: {
            //       v_code:
            //         subdomain === "fashion" ? data?.codeOnlyOnDev : undefined,
            //     },
            //   }
            // );
          },
          onError: () => {
            toast.error("فشل تسجيل الدخول. يرجى المحاولة مرة أخرى");
          },
          onSettled: () => setIsLoading(false),
        }
      );
      return;
    } finally {
      // we end loading in onSettled, but keep this as a safety net
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            تسجيل دخول المتجر
          </CardTitle>
          <CardDescription className="text-base">
            أدخل رقم الهاتف وسنرسل لك رمز تحقق مكوّن من 4 أرقام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dev Only */}

            {isProduction ? null : isLoadingStores ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="flex gap-x-2 items-center justify-center">
                <Select
                  value={selectedStoreId}
                  onValueChange={setSelectedStoreId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المتجر" />
                    {!selectedStoreId && (
                      <p className="text-sm font-medium text-foreground">
                        اختر المتجر
                      </p>
                    )}
                    <Store className="w-4 h-4 ml-2" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores?.data?.map((store: any) => (
                      <SelectItem key={store.id} value={String(store.id)}>
                        {store.name} - {store.domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-foreground"
              >
                رقم الهاتف
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="07XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(normalizePhone(e.target.value))}
                  className="pr-10"
                  dir="ltr"
                  autoComplete="tel"
                  required
                />
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>أدخل الرقم بدون مسافات</span>
                <span dir="ltr">{phoneDigitsCount} digits</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={isLoading || isLoginPending}
            >
              {isLoading || isLoginPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 ml-2" />
                  إرسال رمز التحقق
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              تسجيل دخول الإدارة
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreLogin;
