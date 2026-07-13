import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SettingsCard from "@/new-pages/settings/components/SettingsCard";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import {
  useCalculatePrimeCharges,
  useCreatePrimeMerchant,
  useCreatePrimeShop,
  useCreatePrimeShipment,
  usePrimeBranches,
  usePrimeDistricts,
  usePrimeLogin,
  usePrimeMerchantShops,
  usePrimeOrderShipment,
  usePrimeStates,
  usePrimeSyncLookups,
  useSyncPrimeOrderShipment,
} from "@/api/wrappers/prime.wrappers";
import { extractMerchantLoginId } from "@/utils/prime/setup";
import {
  asPrimeList,
  getPrimeDistrictId,
  getPrimeDistrictLabel,
  getPrimeStateCode,
  getPrimeStateLabel,
} from "@/utils/prime/lookups";
import type { PrimeTestConfig } from "@/api/types/prime";

const CONFIG_KEY = "mel-prime-test-config";

function loadConfig(): PrimeTestConfig {
  try {
    return JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveConfig(config: PrimeTestConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

function JsonBox({ data }: { data: unknown }) {
  if (data == null) return null;
  return (
    <pre className="mt-3 max-h-48 overflow-auto rounded-xl bg-slate-900 p-3 text-left text-[11px] text-slate-100" dir="ltr">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

const PrimeTestPage = () => {
  const { data: storeDetails } = useFetchStoreDetails();
  const [config, setConfig] = useState<PrimeTestConfig>(loadConfig);
  const [lastResult, setLastResult] = useState<unknown>(null);

  const [stateCode, setStateCode] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [branchId, setBranchId] = useState("1");

  const [merchantLoginId, setMerchantLoginId] = useState(
    config.merchantLoginId || "",
  );
  const [senderId, setSenderId] = useState(
    config.senderId ? String(config.senderId) : "",
  );

  const [orderId, setOrderId] = useState("");
  const [receiptAmt, setReceiptAmt] = useState("50000");

  const { data: statesData, isLoading: loadingStates } = usePrimeStates();
  const { data: districtsData, isLoading: loadingDistricts } =
    usePrimeDistricts(stateCode);
  const { data: branchesData } = usePrimeBranches();
  const { data: shopsData, refetch: refetchShops } = usePrimeMerchantShops(
    merchantLoginId,
    !!merchantLoginId,
  );
  const { data: orderShipment, refetch: refetchOrderShipment } =
    usePrimeOrderShipment(orderId, false);

  const loginMutation = usePrimeLogin();
  const syncLookupsMutation = usePrimeSyncLookups();
  const createMerchantMutation = useCreatePrimeMerchant();
  const createShopMutation = useCreatePrimeShop();
  const calculateMutation = useCalculatePrimeCharges();
  const createShipmentMutation = useCreatePrimeShipment();
  const syncOrderMutation = useSyncPrimeOrderShipment();

  const states = useMemo(() => asPrimeList(statesData), [statesData]);
  const districts = useMemo(() => asPrimeList(districtsData), [districtsData]);
  const branches = useMemo(() => asPrimeList(branchesData), [branchesData]);

  useEffect(() => {
    if (states.length > 0) {
      const codes = states.map(getPrimeStateCode).filter(Boolean);
      if (codes.length > 0 && (!stateCode || !codes.includes(stateCode))) {
        setStateCode(codes[0]);
      }
    }
  }, [states, stateCode]);

  useEffect(() => {
    if (!stateCode) return;
    setDistrictId("");
  }, [stateCode]);

  useEffect(() => {
    if (districts.length > 0) {
      const firstId = getPrimeDistrictId(districts[0]);
      if (firstId != null) setDistrictId(String(firstId));
    }
  }, [districts]);

  useEffect(() => {
    const fromStore = storeDetails?.primeMerchant;
    const reservedLoginId = storeDetails?.primeLoginId;
    if (fromStore?.merchantLoginId) {
      setMerchantLoginId(fromStore.merchantLoginId);
    } else if (reservedLoginId) {
      setMerchantLoginId(reservedLoginId);
    }
    if (fromStore?.senderId != null) {
      setSenderId(String(fromStore.senderId));
    }
  }, [storeDetails?.primeMerchant, storeDetails?.primeLoginId]);

  useEffect(() => {
    saveConfig({
      merchantLoginId: merchantLoginId || undefined,
      senderId: senderId ? Number(senderId) : undefined,
    });
  }, [merchantLoginId, senderId]);

  const handleSuccess = (label: string, data: unknown) => {
    setLastResult(data);
    toast.success(label);

    const record = data as Record<string, unknown>;
    if (record?.loginId && typeof record.loginId === "string") {
      setMerchantLoginId(record.loginId);
    }
    if (record?.merchantLoginId && typeof record.merchantLoginId === "string") {
      setMerchantLoginId(record.merchantLoginId);
    }
    if (record?.senderId != null) {
      setSenderId(String(record.senderId));
    }
    if (record?.caseId != null) {
      toast.message(`caseId: ${record.caseId}`);
    }
  };

  const handleError = (error: Error, fallback: string) => {
    const apiError = error as Error & {
      response?: { data?: { message?: string } };
    };
    toast.error(apiError.response?.data?.message || fallback);
    setLastResult(apiError.response?.data ?? { message: error.message });
  };

  const quickCreateMerchant = () => {
    const loginId =
      storeDetails?.primeLoginId || storeDetails?.primeMerchant?.merchantLoginId;
    const districtNum =
      getPrimeDistrictId(districts[0] ?? {}) ?? Number(districtId);
    if (!stateCode || !Number.isInteger(districtNum) || districtNum < 1) {
      toast.error("اختر محافظة وقضاء صحيحين");
      return;
    }
    createMerchantMutation.mutate(
      {
        name: (storeDetails?.name as string) || "متجر تجريبي",
        ...(loginId ? { loginId } : {}),
        password: "SecurePass123!",
        phone1: (storeDetails?.phone as string) || "07701234567",
        email: storeDetails?.email as string | undefined,
        state: stateCode,
        district: districtNum,
        addressDetails: (storeDetails?.location as string) || "بغداد",
        latitude: String(storeDetails?.latitude ?? "33.31"),
        longtitude: String(storeDetails?.longitude ?? "44.35"),
        branch: Number(branchId) || 1,
        storeId: storeDetails?.id,
      },
      {
        onSuccess: (data) => {
          handleSuccess("تم إنشاء التاجر", data);
          const createdId = extractMerchantLoginId(data, loginId);
          if (createdId) setMerchantLoginId(createdId);
        },
        onError: (e) => handleError(e, "فشل إنشاء التاجر"),
      },
    );
  };

  const quickCreateShop = () => {
    if (!merchantLoginId) {
      toast.error("أدخل merchantLoginId أولاً");
      return;
    }
    createShopMutation.mutate(
      {
        merchantLoginId,
        body: {
          name: "المحل الرئيسي",
          phone1: storeDetails?.businessPhone || "07701234567",
        },
      },
      {
        onSuccess: (data) => {
          handleSuccess("تم إنشاء المحل", data);
          refetchShops();
          const shops = asPrimeList(data);
          const firstShop = shops[0] ?? (data as Record<string, unknown>);
          if (firstShop?.senderId != null) {
            setSenderId(String(firstShop.senderId));
          } else if ((data as Record<string, unknown>)?.senderId != null) {
            setSenderId(String((data as Record<string, unknown>).senderId));
          }
        },
        onError: (e) => handleError(e, "فشل إنشاء المحل"),
      },
    );
  };

  const isBusy =
    loginMutation.isPending ||
    syncLookupsMutation.isPending ||
    createMerchantMutation.isPending ||
    createShopMutation.isPending ||
    calculateMutation.isPending ||
    createShipmentMutation.isPending ||
    syncOrderMutation.isPending;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 pb-10" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Truck className="size-5 text-primary" />
          <h1 className="text-xl font-bold text-blue-950">اختبار Prime</h1>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/settings/general">
            <ArrowLeft className="ml-1 size-4" />
            الإعدادات
          </Link>
        </Button>
      </div>

      <p className="text-sm text-slate-500">
        صفحة تجريبية — استخدم merchantLoginId من{" "}
        <code className="text-xs">store-details.prime_merchant</code> فقط. لا
        تختار من قائمة GET /prime/merchants.
      </p>

      <SettingsCard title="الإعداد المحفوظ">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>merchantLoginId (من الباكند)</Label>
            <Input
              value={merchantLoginId}
              readOnly
              placeholder="يأتي من store-details"
              dir="ltr"
            />
          </div>
          <div className="space-y-1">
            <Label>senderId</Label>
            <Input
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
              placeholder="83352"
              dir="ltr"
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="1) Auth و Lookups">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={isBusy}
            onClick={() =>
              loginMutation.mutate(undefined, {
                onSuccess: (d) => handleSuccess("تم تسجيل دخول Prime", d),
                onError: (e) => handleError(e, "فشل تسجيل الدخول"),
              })
            }
          >
            {loginMutation.isPending && (
              <Loader2 className="ml-1 size-3 animate-spin" />
            )}
            Prime Login
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={isBusy}
            onClick={() =>
              syncLookupsMutation.mutate(undefined, {
                onSuccess: (d) => handleSuccess("تمت مزامنة القوائم", d),
                onError: (e) => handleError(e, "فشل المزامنة"),
              })
            }
          >
            Sync Lookups
          </Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>المحافظة</Label>
            <Select value={stateCode} onValueChange={setStateCode}>
              <SelectTrigger>
                <SelectValue placeholder={loadingStates ? "..." : "اختر"} />
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
            <Label>القضاء</Label>
            <Select value={districtId} onValueChange={setDistrictId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={loadingDistricts ? "..." : "اختر"}
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
          <div className="space-y-1">
            <Label>الفرع</Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={String(b.id)} value={String(b.id)}>
                    {String(b.name ?? b.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="2) التاجر والمحل">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={isBusy} onClick={quickCreateMerchant}>
            إنشاء تاجر سريع
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={isBusy}
            onClick={quickCreateShop}
          >
            إنشاء محل
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!merchantLoginId}
            onClick={() => refetchShops()}
          >
            تحديث المحلات
          </Button>
        </div>
        <JsonBox
          data={{
            prime_login_id: storeDetails?.primeLoginId ?? null,
            prime_merchant: storeDetails?.primeMerchant ?? null,
            shops: shopsData,
          }}
        />
      </SettingsCard>

      <SettingsCard title="3) الشحنة">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>مبلغ الاستلام (IQD)</Label>
            <Input
              value={receiptAmt}
              onChange={(e) => setReceiptAmt(e.target.value)}
              dir="ltr"
            />
          </div>
          <div className="space-y-1">
            <Label>orderId (اختياري)</Label>
            <Input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="uuid"
              dir="ltr"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={isBusy || !senderId}
            onClick={() =>
              calculateMutation.mutate(
                {
                  state: stateCode,
                  district: Number(districtId) || 469,
                  receiptAmtIqd: Number(receiptAmt) || 0,
                  senderId: Number(senderId),
                },
                {
                  onSuccess: (d) => handleSuccess("رسوم الشحن", d),
                  onError: (e) => handleError(e, "فشل حساب الرسوم"),
                },
              )
            }
          >
            حساب الرسوم
          </Button>
          <Button
            size="sm"
            disabled={isBusy || !senderId}
            onClick={() =>
              createShipmentMutation.mutate(
                {
                  senderSystemCaseIdWithCharacters: `ORD-${Date.now()}`,
                  senderId: Number(senderId),
                  receiverName: "عميل تجريبي",
                  receiverHp1: "07701234567",
                  locationDetails: "بغداد - تجريبي",
                  state: stateCode,
                  district: Number(districtId) || 469,
                  receiptAmtIqd: Number(receiptAmt) || 0,
                  productInfo: "منتج تجريبي*1",
                  qty: 1,
                  orderId: orderId || undefined,
                },
                {
                  onSuccess: (d) => handleSuccess("تم إنشاء الشحنة", d),
                  onError: (e) => handleError(e, "فشل إنشاء الشحنة"),
                },
              )
            }
          >
            إنشاء شحنة تجريبية
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard title="4) شحنة الطلب">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={!orderId}
            onClick={() => refetchOrderShipment()}
          >
            جلب شحنة الطلب
          </Button>
          <Button
            size="sm"
            disabled={!orderId || syncOrderMutation.isPending}
            onClick={() =>
              syncOrderMutation.mutate(orderId, {
                onSuccess: (d) => {
                  handleSuccess("تمت المزامنة", d);
                  refetchOrderShipment();
                },
                onError: (e) => handleError(e, "فشل المزامنة"),
              })
            }
          >
            مزامنة الحالة
          </Button>
        </div>
        <JsonBox data={orderShipment} />
      </SettingsCard>

      <SettingsCard title="آخر استجابة">
        <JsonBox data={lastResult} />
      </SettingsCard>
    </div>
  );
};

export default PrimeTestPage;
