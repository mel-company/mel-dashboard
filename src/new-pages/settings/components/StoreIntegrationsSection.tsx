import { useMemo, useState } from "react";
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
