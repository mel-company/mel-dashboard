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
      {/* RTL: the first child sits rightmost. Figma orders these
          order-editing → auto-cancel from the right.

          Cash on delivery used to sit first here and no longer does. It was
          two faults at once: a second switch over a flag the payment
          providers card already owns, and a dead one — the General tab saves
          through `PUT /settings/current`, whose DTO has no
          `cash_on_delivery` and whose service never wrote the column, so
          flipping it toasted success and changed nothing. The surviving
          switch writes through `PUT /settings/payment-methods`, which also
          mirrors the store's cash-on-delivery `StorePaymentMethod` row, and
          it reads availability so a method the platform withdrew says
          «قريبا» instead of silently saving. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <SettingsLabel>السماح بتعديل الطلبات</SettingsLabel>
          <div className="flex flex-col items-start gap-2">
            <Switch
              checked={storeForm.allowOrderEditing}
              activeLabel="مفعل"
              disabledLabel="معطل"
              onToggle={(checked) =>
                updateStoreField("allowOrderEditing", checked)
              }
            />
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              يمكن تعديل الطلب قبل المعالجة والشحن
            </p>
          </div>
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
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-sky-500">
              ساعات
            </span>
          </div>
        </SettingsField>
      </div>
    </SettingsCard>
  );
};

export default OrdersSection;
