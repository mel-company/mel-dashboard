import SettingsCard from "./SettingsCard";
import { SettingsField, SettingsInput } from "./SettingsField";
import type { useSettingsPage } from "@/hooks/use-settings-page";

type Props = Pick<
  ReturnType<typeof useSettingsPage>,
  "storeForm" | "handleStoreInputChange"
>;

const DeliveryNotesSection = ({
  storeForm,
  handleStoreInputChange,
}: Props) => {
  return (
    <SettingsCard title="وقت التوصيل وملاحظات">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_225px]">
        <SettingsField label="ملاحظات التوصيل" htmlFor="deliveryNotes">
          <SettingsInput
            id="deliveryNotes"
            name="deliveryNotes"
            value={storeForm.deliveryNotes}
            onChange={handleStoreInputChange}
            placeholder="معلومات حول التوصيل تظهر للعملاء (مثل: التوصيل من الساعة 9 صباحاً حتى 5 مساءً)"
          />
        </SettingsField>

        <SettingsField
          label="عدد أيام التوصيل المتوقعة"
          htmlFor="estimatedDeliveryDays"
        >
          <div className="relative">
            <SettingsInput
              id="estimatedDeliveryDays"
              name="estimatedDeliveryDays"
              type="number"
              min={1}
              value={storeForm.estimatedDeliveryDays}
              onChange={handleStoreInputChange}
              className="pl-14 text-right"
            />
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-sky-500">
              أيام
            </span>
          </div>
        </SettingsField>
      </div>
    </SettingsCard>
  );
};

export default DeliveryNotesSection;
