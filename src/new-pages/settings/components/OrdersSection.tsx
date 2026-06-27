import { Switch } from "@/components/ui/switch";
import SettingsCard from "./SettingsCard";
import { SettingsField, SettingsInput, SettingsLabel } from "./SettingsField";
import type { useSettingsPage } from "@/hooks/use-settings-page";

type Props = Pick<
  ReturnType<typeof useSettingsPage>,
  "storeForm" | "updateStoreField" | "handleStoreInputChange"
>;

const OrdersSection = ({
  storeForm,
  updateStoreField,
  handleStoreInputChange,
}: Props) => {
  return (
    <SettingsCard title="الطلبات">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <SettingsLabel>تفعيل الدفع عند الاستلام</SettingsLabel>
          <Switch
            checked={storeForm.cashOnDelivery}
            activeLabel="مفعل"
            disabledLabel="معطل"
            onToggle={(checked) => updateStoreField("cashOnDelivery", checked)}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            سيظهر خيار الدفع عند الاستلام للعميل
          </p>
        </div>

        <div className="space-y-2">
          <SettingsLabel>السماح بتعديل الطلبات</SettingsLabel>
          <Switch
            checked={storeForm.allowOrderEditing}
            activeLabel="مفعل"
            disabledLabel="معطل"
            onToggle={(checked) =>
              updateStoreField("allowOrderEditing", checked)
            }
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            يمكن تعديل الطلب قبل المعالجة والشحن
          </p>
        </div>

        <SettingsField
          label="إلغاء الطلبات غير المدفوعة بعد (ساعة)"
          htmlFor="autoCancelUnpaidHours"
        >
          <div className="relative">
            <SettingsInput
              id="autoCancelUnpaidHours"
              name="autoCancelUnpaidHours"
              type="number"
              min={1}
              value={storeForm.autoCancelUnpaidHours}
              onChange={handleStoreInputChange}
              className="pl-16 text-right"
            />
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
              ساعة
            </span>
          </div>
        </SettingsField>
      </div>
    </SettingsCard>
  );
};

export default OrdersSection;
