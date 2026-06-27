import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronDown, Truck } from "lucide-react";
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

const StoreIntegrationsSection = () => {
  const { data: domainDetails } = useFindDomainDetails();
  const { data: storeDetails } = useFetchStoreDetails();
  const { data: currentSettings } = useFetchCurrentSettings();
  const { data: paymentProviders } = useFetchPaymentProviders();
  const { data: storePaymentMethods } = useFetchStorePaymentMethods();

  const updatePaymentMethodsMutation = useUpdatePaymentMethods();
  const upsertMutation = useUpsertStorePaymentMethod();

  const [cashOnDelivery, setCashOnDelivery] = useState(false);
  const [domainDialogOpen, setDomainDialogOpen] = useState(false);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setCashOnDelivery(currentSettings.cash_on_delivery ?? false);
    }
  }, [currentSettings]);

  const paymentMethods = useMemo(() => {
    if (!paymentProviders) return [];
    return paymentProviders.flatMap(
      (p: { methods?: { id: string; name: string }[] }) =>
        (p.methods ?? []).map((m) => m),
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
    setCashOnDelivery(enabled);
    updatePaymentMethodsMutation.mutate(
      { cash_on_delivery: enabled },
      {
        onSuccess: () => toast.success("تم تحديث إعدادات الدفع"),
        onError: () => toast.error("فشل تحديث إعدادات الدفع"),
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

  const domainUrl = domainDetails?.domain
    ? `${domainDetails.domain}.mel.iq`
    : "azyaa.mel.iq";

  const deliveryCompanyName =
    storeDetails?.deliveryCompany?.name ?? "لم يتم التحديد";

  return (
    <>
      <div className="space-y-4">
        <SettingsCard title="نطاق الموقع الالكتروني">
          <button
            type="button"
            className="w-full text-right"
            onClick={() => setDomainDialogOpen(true)}
          >
            <SettingsInput
              readOnly
              value={domainUrl}
              dir="ltr"
              className="cursor-pointer text-center"
            />
          </button>
        </SettingsCard>

        <SettingsCard title="أعدادات مزودين خدمات الدفع">
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2.5">
              <span className="text-sm">الدفع عند الاستلام</span>
              <Switch
                checked={cashOnDelivery}
                onToggle={handleCodToggle}
                disabled={updatePaymentMethodsMutation.isPending}
              />
            </div>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2.5"
              >
                <span className="text-sm">{method.name}</span>
                <Switch
                  checked={isMethodEnabled(method.id)}
                  onToggle={(v) => handleMethodToggle(method.id, v)}
                  disabled={upsertMutation.isPending}
                />
              </div>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard title="أعدادات مزودين خدمات التوصيل">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-right"
            onClick={() => setDeliveryDialogOpen(true)}
          >
            <ChevronDown className="size-4 shrink-0 text-slate-400" />
            <div className="flex items-center gap-2">
              <span className="text-sm">{deliveryCompanyName}</span>
              <Truck className="size-4 text-slate-500" />
            </div>
          </button>
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
        currentDeliveryCompanyId={storeDetails?.deliveryCompanyId}
      />
    </>
  );
};

export default StoreIntegrationsSection;
