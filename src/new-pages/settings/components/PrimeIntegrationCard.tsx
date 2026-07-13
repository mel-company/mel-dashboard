import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { primeAPI } from "@/api/endpoints/prime.endpoints";
import { storeAPI } from "@/api/endpoints/store.endpoints";
import { primeKeys } from "@/api/wrappers/prime.wrappers";
import { storeKeys, useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import {
  useCreatePrimeMerchant,
  useCreatePrimeShop,
  usePrimeDistricts,
  usePrimeLogin,
  usePrimeStates,
} from "@/api/wrappers/prime.wrappers";
import { usePrimeSetupStatus } from "@/hooks/use-prime-setup-status";
import {
  asPrimeList,
  getPrimeDistrictId,
  getPrimeDistrictLabel,
  getPrimeStateCode,
  getPrimeStateLabel,
} from "@/utils/prime/lookups";
import {
  extractMerchantLoginId,
  extractSenderId,
} from "@/utils/prime/setup";

const PRIME_WEBSITE = "https://prime.iq";

const PrimeIntegrationCard = () => {
  const queryClient = useQueryClient();
  const { data: storeDetails } = useFetchStoreDetails();
  const setupStatus = usePrimeSetupStatus();
  const loginMutation = usePrimeLogin();
  const createMerchantMutation = useCreatePrimeMerchant();
  const createShopMutation = useCreatePrimeShop();
  const [isSettingUp, setIsSettingUp] = useState(false);

  const [stateCode, setStateCode] = useState("");
  const [districtId, setDistrictId] = useState("");

  const showMerchantForm = !setupStatus.hasAccount;
  const backendLoginId = storeDetails?.primeLoginId ?? undefined;

  const { data: statesData, isLoading: loadingStates } = usePrimeStates(
    showMerchantForm,
  );
  const { data: districtsData, isLoading: loadingDistricts } =
    usePrimeDistricts(stateCode, showMerchantForm && !!stateCode);

  const states = useMemo(() => asPrimeList(statesData), [statesData]);
  const districts = useMemo(() => asPrimeList(districtsData), [districtsData]);

  useEffect(() => {
    if (!showMerchantForm || states.length === 0) return;
    const codes = states.map(getPrimeStateCode).filter(Boolean);
    if (codes.length === 0) return;
    if (!stateCode || !codes.includes(stateCode)) {
      setStateCode(codes[0]);
    }
  }, [showMerchantForm, states, stateCode]);

  useEffect(() => {
    if (!showMerchantForm || !stateCode) return;
    setDistrictId("");
  }, [showMerchantForm, stateCode]);

  useEffect(() => {
    if (!showMerchantForm || districts.length === 0) return;
    const firstId = getPrimeDistrictId(districts[0]);
    if (firstId != null) {
      setDistrictId(String(firstId));
    }
  }, [showMerchantForm, districts]);

  const deliveryCompany = storeDetails?.deliveryCompany;
  const website = deliveryCompany?.website || PRIME_WEBSITE;
  const logo = deliveryCompany?.logo;
  const companyName = deliveryCompany?.name || "Prime";

  const districtNumber = Number(districtId);
  const canSubmitMerchant =
    !!stateCode &&
    Number.isInteger(districtNumber) &&
    districtNumber >= 1 &&
    !loadingStates &&
    !loadingDistricts;

  const createShopForMerchant = async (merchantLoginId: string) => {
    const shopsRaw = await primeAPI.getMerchantShops(merchantLoginId);
    const shops = asPrimeList(shopsRaw);
    const existingSenderId = extractSenderId(shops[0]);

    if (existingSenderId) return;

    await createShopMutation.mutateAsync({
      merchantLoginId,
      body: {
        name: (storeDetails?.name as string) || "المحل الرئيسي",
        phone1: (storeDetails?.phone as string) || "07701234567",
      },
    });
  };

  const handleCreateMerchant = async () => {
    if (!canSubmitMerchant) {
      if (loadingStates || loadingDistricts) {
        toast.error("انتظر تحميل المحافظات والأقضية");
      } else if (!stateCode) {
        toast.error("اختر المحافظة");
      } else {
        toast.error("اختر القضاء");
      }
      return;
    }

    setIsSettingUp(true);
    try {
      await loginMutation.mutateAsync();

      const merchant = await createMerchantMutation.mutateAsync({
        name: (storeDetails?.name as string) || "متجري",
        ...(backendLoginId ? { loginId: backendLoginId } : {}),
        password: "SecurePass123!",
        phone1: (storeDetails?.phone as string) || "07701234567",
        email: storeDetails?.email as string | undefined,
        state: stateCode,
        district: districtNumber,
        addressDetails: (storeDetails?.location as string) || "العراق",
        latitude: String(storeDetails?.latitude ?? "30.45"),
        longtitude: String(storeDetails?.longitude ?? "47.86"),
        branch: 1,
      });

      const updatedStore = await queryClient.fetchQuery({
        queryKey: storeKeys.details(),
        queryFn: () => storeAPI.fetchDetails(),
      });

      const merchantLoginId =
        updatedStore?.primeMerchant?.merchantLoginId ??
        extractMerchantLoginId(merchant, backendLoginId);
      if (!merchantLoginId) {
        throw new Error("لم يُرجع الخادم معرّف التاجر");
      }

      await createShopForMerchant(merchantLoginId);

      await queryClient.invalidateQueries({ queryKey: primeKeys.all });
      await queryClient.refetchQueries({ queryKey: storeKeys.details() });
      toast.success("تم إنشاء حساب Prime وربطه بمتجرك");
    } catch (error) {
      const apiError = error as Error & {
        response?: { data?: { message?: string | string[] } };
      };
      const message = apiError.response?.data?.message;
      toast.error(
        Array.isArray(message)
          ? message.join(" — ")
          : message || "فشل إنشاء حساب Prime.",
      );
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleCreateShop = async () => {
    const merchantLoginId = setupStatus.merchantLoginId;
    if (!merchantLoginId) return;

    setIsSettingUp(true);
    try {
      await loginMutation.mutateAsync();
      await createShopForMerchant(merchantLoginId);

      await queryClient.invalidateQueries({ queryKey: primeKeys.all });
      await queryClient.refetchQueries({ queryKey: storeKeys.details() });
      toast.success("تم إنشاء المحل — جاهز للشحن");
    } catch (error) {
      const apiError = error as Error & {
        response?: { data?: { message?: string } };
      };
      toast.error(
        apiError.response?.data?.message || "فشل إنشاء المحل في Prime",
      );
    } finally {
      setIsSettingUp(false);
    }
  };

  const busy =
    isSettingUp ||
    loginMutation.isPending ||
    createMerchantMutation.isPending ||
    createShopMutation.isPending;

  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {logo ? (
            <img
              src={logo}
              alt={companyName}
              className="size-10 rounded-xl bg-white object-contain p-1"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-sky-700">
              P
            </div>
          )}
          <div className="min-w-0 text-right">
            <p className="text-sm font-semibold text-sky-950">{companyName}</p>
            <p className="text-[11px] leading-snug text-sky-700/80">
              شركة التوصيل المفعّلة لمتجرك
            </p>
          </div>
        </div>

        {setupStatus.isLoading ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-sky-600" />
        ) : setupStatus.isReady ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            <CheckCircle2 className="size-3" />
            جاهز للشحن
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700">
            <AlertCircle className="size-3" />
            {setupStatus.needsShop ? "يحتاج محل" : "يحتاج حساب"}
          </span>
        )}
      </div>

      {setupStatus.isReady ? (
        <div
          className="rounded-xl bg-white/80 px-3 py-2 text-[11px] text-slate-600"
          dir="ltr"
        >
          <p>merchant: {setupStatus.merchantLoginId}</p>
          <p>senderId: {setupStatus.senderId}</p>
        </div>
      ) : setupStatus.needsShop ? (
        <p className="text-xs leading-relaxed text-sky-800">
          حساب Prime موجود ({setupStatus.merchantLoginId}) — أنشئ المحل
          للحصول على senderId.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-sky-800">
            أنشئ حساب Prime لمتجرك. معرّف الحساب يُحدَّد من النظام ولا يمكن
            تعديله من هنا.
          </p>
          {backendLoginId ? (
            <div
              className="rounded-xl border border-sky-200 bg-white px-3 py-2.5"
              dir="ltr"
            >
              <p className="text-[10px] text-sky-600">معرّف الحساب المحجوز</p>
              <p className="text-sm font-semibold text-sky-950">
                {backendLoginId}
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-sky-700">
              جاري تحميل معرّف الحساب من النظام...
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">المحافظة</Label>
              <Select
                value={stateCode || undefined}
                onValueChange={setStateCode}
                disabled={loadingStates || states.length === 0}
              >
                <SelectTrigger className="h-9">
                  <SelectValue
                    placeholder={
                      loadingStates
                        ? "جاري التحميل..."
                        : states.length === 0
                          ? "لا توجد محافظات"
                          : "اختر المحافظة"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {states.map((s) => {
                    const code = getPrimeStateCode(s);
                    if (!code) return null;
                    return (
                      <SelectItem key={code} value={code}>
                        {getPrimeStateLabel(s)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">القضاء</Label>
              <Select
                value={districtId || undefined}
                onValueChange={setDistrictId}
                disabled={
                  !stateCode || loadingDistricts || districts.length === 0
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue
                    placeholder={
                      !stateCode
                        ? "اختر المحافظة أولاً"
                        : loadingDistricts
                          ? "جاري التحميل..."
                          : districts.length === 0
                            ? "لا توجد أقضية"
                            : "اختر القضاء"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => {
                    const id = getPrimeDistrictId(d);
                    if (id == null) return null;
                    return (
                      <SelectItem key={String(id)} value={String(id)}>
                        {getPrimeDistrictLabel(d)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!setupStatus.hasAccount && (
          <Button
            size="sm"
            disabled={busy || !canSubmitMerchant}
            onClick={handleCreateMerchant}
          >
            {busy && <Loader2 className="ml-1 size-3 animate-spin" />}
            إنشاء حساب Prime
          </Button>
        )}
        {setupStatus.needsShop && (
          <Button size="sm" disabled={busy} onClick={handleCreateShop}>
            {busy && <Loader2 className="ml-1 size-3 animate-spin" />}
            إنشاء المحل
          </Button>
        )}
        <Button size="sm" variant="outline" asChild>
          <a href={website} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="ml-1 size-3" />
            زيارة موقع Prime
          </a>
        </Button>
      </div>
    </div>
  );
};

export default PrimeIntegrationCard;
