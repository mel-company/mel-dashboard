import { useEffect, useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import SettingsCard from "./SettingsCard";
import { SettingsInput } from "./SettingsField";
import { useFindDomainDetails } from "@/api/wrappers/domain.wrappers";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import {
  useFetchCurrentSettings,
  useFetchStorePaymentMethods,
  useUpdatePaymentMethods,
  useUpsertStorePaymentMethod,
} from "@/api/wrappers/settings.wrappers";
import { useFetchPaymentProviders } from "@/api/wrappers/payment.wrappers";
import { useUpdateStoreDetails } from "@/api/wrappers/settings.wrappers";
import { useFetchStates } from "@/api/wrappers/state.wrappers";
import { useFetchRegions } from "@/api/wrappers/region.wrappers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SelectDeliveryCompanyDialog from "@/pages/settings/SelectDeliveryCompanyDialog";
import DomainSettings from "@/pages/settings/DomainSettings";
import PrimeIntegrationCard from "./PrimeIntegrationCard";
import { isPrimeDelivery } from "@/api/types/store";
import settingsGearIcon from "@/assets/settings/settings-gear.svg";
import moneyIcon from "@/assets/settings/money.svg";
import qiCardIcon from "@/assets/settings/qi-card.svg";
import chevronIcon from "@/assets/settings/chevron.svg";
import deliveryArrowIcon from "@/assets/settings/delivery-arrow.svg";

type PaymentMethodOption = { id: string; name: string };

const SectionGear = () => (
  <div className="flex size-[35px] shrink-0 items-center justify-center rounded-[10px] bg-sky-500/10">
    <img src={settingsGearIcon} alt="" className="size-5" />
  </div>
);

const isQiMethod = (name: string) =>
  /qi|كي|كي.?كارد|qicard/i.test(name);

const StoreIntegrationsSection = () => {
  const { data: domainDetails } = useFindDomainDetails();
  const { data: storeDetails } = useFetchStoreDetails();
  const { data: currentSettings } = useFetchCurrentSettings();
  const { data: paymentProviders } = useFetchPaymentProviders();
  const { data: storePaymentMethods } = useFetchStorePaymentMethods();

  const updatePaymentMethodsMutation = useUpdatePaymentMethods();
  const upsertMutation = useUpsertStorePaymentMethod();

  const [domainDialogOpen, setDomainDialogOpen] = useState(false);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [optimisticCod, setOptimisticCod] = useState<boolean | null>(null);

  /**
   * Where the store ships from.
   *
   * Half of what decides an Iraqi delivery price is whether the parcel leaves
   * the province, and nothing recorded the store's own province — the address
   * was free text. Kept as the platform's province and city rather than a
   * courier's code, so it survives changing courier.
   */
  const updateStoreDetails = useUpdateStoreDetails();
  const [originStateId, setOriginStateId] = useState("");
  const [originRegionId, setOriginRegionId] = useState("");

  const { data: statesData } = useFetchStates();
  const { data: regionsData } = useFetchRegions(originStateId, !!originStateId);

  const asList = (value: unknown): any[] =>
    Array.isArray(value) ? value : ((value as any)?.data ?? []);

  const states = useMemo(() => asList(statesData), [statesData]);
  const regions = useMemo(() => asList(regionsData), [regionsData]);

  useEffect(() => {
    setOriginStateId((storeDetails as any)?.originStateId ?? "");
    setOriginRegionId((storeDetails as any)?.originRegionId ?? "");
  }, [storeDetails]);

  /** Names come back as `{ ar, en }` JSON, or a bare string on older rows. */
  const placeName = (name: unknown): string => {
    if (!name) return "";
    if (typeof name === "string") return name;
    const n = name as Record<string, string | undefined>;
    return n.ar || n.en || n.arabic || n.english || "";
  };

  const saveOrigin = (stateId: string, regionId: string) => {
    updateStoreDetails.mutate(
      { originStateId: stateId || null, originRegionId: regionId || null },
      {
        onSuccess: () => toast.success("تم حفظ موقع الفرع"),
        onError: () => toast.error("فشل حفظ موقع الفرع"),
      },
    );
  };

  const cashOnDelivery =
    optimisticCod ?? currentSettings?.cash_on_delivery ?? false;

  const paymentMethods = useMemo(() => {
    if (!paymentProviders) return [] as PaymentMethodOption[];
    return paymentProviders.flatMap(
      (p: { methods?: PaymentMethodOption[] }) => p.methods ?? [],
    );
  }, [paymentProviders]);

  const isMethodEnabled = (methodId: string) => {
    const storePm = (
      storePaymentMethods as
        | { paymentMethodId: string; isEnabled: boolean }[]
        | undefined
    )?.find((s) => s.paymentMethodId === methodId);
    return storePm?.isEnabled ?? false;
  };

  const handleCodToggle = (enabled: boolean) => {
    setOptimisticCod(enabled);
    updatePaymentMethodsMutation.mutate(
      { cash_on_delivery: enabled },
      {
        onSuccess: () => {
          toast.success("تم تحديث إعدادات الدفع");
          setOptimisticCod(null);
        },
        onError: () => {
          toast.error("فشل تحديث إعدادات الدفع");
          setOptimisticCod(null);
        },
      },
    );
  };

  const handleMethodToggle = (methodId: string, enabled: boolean) => {
    upsertMutation.mutate(
      { paymentMethodId: methodId, isEnabled: enabled },
      {
        onSuccess: () => toast.success("تم تحديث طريقة الدفع"),
        onError: () => toast.error("فشل تحديث طريقة الدفع"),
      },
    );
  };

  const subdomain = domainDetails?.domain?.trim() || "azyaa";

  const deliveryCompany = storeDetails?.deliveryCompany;
  const deliveryCompanyName = deliveryCompany?.name ?? "لم يتم التحديد";

  return (
    <>
      <div className="flex flex-col gap-4">
        <SettingsCard title="نطاق الموقع الالكتروني">
          <button
            type="button"
            className="w-full space-y-2 text-right"
            onClick={() => setDomainDialogOpen(true)}
          >
            <p className="px-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              النطاق
            </p>
            <SettingsInput
              readOnly
              value={subdomain}
              dir="ltr"
              className="cursor-pointer text-center"
            />
            <p className="px-1 text-[13px] text-slate-500">
              يمكنك تحديث النطاق الفرعي كل 30 يوم
            </p>
          </button>
        </SettingsCard>

        <SettingsCard
          title="أعدادات مزودين خدمات الدفع"
          titleAccessory={<SectionGear />}
        >
          <div className="space-y-3">
            <div className="flex h-12 items-center justify-between rounded-[14px] bg-slate-100 px-4 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <span className="relative size-6 shrink-0 overflow-hidden">
                  <img
                    src={moneyIcon}
                    alt=""
                    className="size-full object-contain"
                  />
                </span>
                <span className="text-[13px] text-slate-900 dark:text-slate-100">
                  الدفع عند الاستلام
                </span>
              </div>
              <Switch
                checked={cashOnDelivery}
                activeLabel="مفعل"
                disabledLabel="معطل"
                onToggle={handleCodToggle}
                disabled={updatePaymentMethodsMutation.isPending}
              />
            </div>

            {paymentMethods.map((method: PaymentMethodOption) => (
              <div
                key={method.id}
                className="flex h-12 items-center justify-between rounded-[14px] bg-slate-100 px-4 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  {isQiMethod(method.name) ? (
                    <img
                      src={qiCardIcon}
                      alt=""
                      className="h-6 w-6 object-contain"
                    />
                  ) : null}
                  <span className="text-[13px] text-slate-900 dark:text-slate-100">
                    {method.name}
                  </span>
                </div>
                <Switch
                  checked={isMethodEnabled(method.id)}
                  activeLabel="مفعل"
                  disabledLabel="معطل"
                  onToggle={(v) => handleMethodToggle(method.id, v)}
                  disabled={upsertMutation.isPending}
                />
              </div>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard
          title="أعدادات مزودين خدمات التوصيل"
          titleAccessory={<SectionGear />}
        >
          <p className="mb-2 px-1 text-sm font-medium text-slate-900 dark:text-slate-100">
            اختيار شركة التوصيل
          </p>
          <button
            type="button"
            className="flex h-12 w-full items-center gap-3 rounded-[14px] bg-slate-100 px-4 text-right dark:bg-slate-900"
            onClick={() => setDeliveryDialogOpen(true)}
          >
            <img
              src={deliveryArrowIcon}
              alt=""
              className="h-6 w-[21px] shrink-0 object-contain"
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
              {deliveryCompanyName}
            </span>
            <img src={chevronIcon} alt="" className="size-6 shrink-0" />
          </button>
          <p className="mt-2 px-1 text-[13px] text-slate-500">
            يمكنك تغيير شركة التوصيل كل 30 يوم
          </p>

          <div className="mt-4 space-y-2">
            <p className="px-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              موقع الفرع
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Select
                value={originStateId}
                onValueChange={(value) => {
                  setOriginStateId(value);
                  // The city list follows the province; keeping the previous
                  // selection would save a city in a different province.
                  setOriginRegionId("");
                  saveOrigin(value, "");
                }}
              >
                <SelectTrigger className="h-12 rounded-[14px] bg-slate-100 dark:bg-slate-900">
                  <SelectValue placeholder="المحافظة" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state: any) => (
                    <SelectItem key={state.id} value={state.id}>
                      {placeName(state.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={originRegionId}
                onValueChange={(value) => {
                  setOriginRegionId(value);
                  saveOrigin(originStateId, value);
                }}
                disabled={!originStateId}
              >
                <SelectTrigger className="h-12 rounded-[14px] bg-slate-100 dark:bg-slate-900">
                  <SelectValue placeholder="المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region: any) => (
                    <SelectItem key={region.id} value={region.id}>
                      {placeName(region.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="px-1 text-[13px] text-slate-500">
              تُستخدم لحساب أجور التوصيل — التوصيل داخل نفس المحافظة يُحسب بسعر
              مختلف.
            </p>
          </div>

          {isPrimeDelivery(storeDetails) ? (
            <div className="mt-3">
              <PrimeIntegrationCard />
            </div>
          ) : null}
        </SettingsCard>
      </div>

      <Dialog open={domainDialogOpen} onOpenChange={setDomainDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DomainSettings />
        </DialogContent>
      </Dialog>

      <SelectDeliveryCompanyDialog
        open={deliveryDialogOpen}
        onOpenChange={setDeliveryDialogOpen}
        currentDeliveryCompanyId={
          storeDetails?.deliveryCompanyId ?? undefined
        }
      />
    </>
  );
};

export default StoreIntegrationsSection;
