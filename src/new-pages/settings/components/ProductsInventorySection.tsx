import { Switch } from "@/components/ui/switch";
import SettingsCard from "./SettingsCard";
import { SettingsField, SettingsInput, SettingsLabel } from "./SettingsField";
import type { useSettingsPage } from "@/hooks/use-settings-page";

type Props = Pick<
  ReturnType<typeof useSettingsPage>,
  "storeForm" | "updateStoreField" | "handleStoreInputChange"
>;

const ProductsInventorySection = ({
  storeForm,
  updateStoreField,
  handleStoreInputChange,
}: Props) => {
  const isPublished = storeForm.defaultProductStatus === "PUBLISHED";

  return (
    <SettingsCard title="المنتجات والمخزون">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_225px]">
        <SettingsField label="الحد الادنى للمنتجات" htmlFor="lowStockThreshold">
          <div className="relative">
            <SettingsInput
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              min={1}
              value={storeForm.lowStockThreshold}
              onChange={handleStoreInputChange}
              className="pl-14 text-right"
            />
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-sky-500">
              قطع
            </span>
          </div>
        </SettingsField>

        <div className="space-y-2">
          <SettingsLabel>حالة المنتج الافتراضية</SettingsLabel>
          <div className="flex flex-col items-end gap-2">
            <Switch
              checked={isPublished}
              activeLabel="نشر مباشر"
              disabledLabel="مسودة"
              onToggle={(checked) =>
                updateStoreField(
                  "defaultProductStatus",
                  checked ? "PUBLISHED" : "DRAFT",
                )
              }
            />
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              يتم نشر المنتج مباشرتا بعد حفظ
            </p>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
};

export default ProductsInventorySection;
