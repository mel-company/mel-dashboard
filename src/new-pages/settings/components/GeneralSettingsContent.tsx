import type { useSettingsPage } from "@/hooks/use-settings-page";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import BasicStoreInfoSection from "./BasicStoreInfoSection";
import StoreAppearanceSection from "./StoreAppearanceSection";
import DeliveryNotesSection from "./DeliveryNotesSection";
import ProductsInventorySection from "./ProductsInventorySection";
import OrdersSection from "./OrdersSection";

type Props = Pick<
  ReturnType<typeof useSettingsPage>,
  | "storeForm"
  | "updateStoreField"
  | "handleStoreInputChange"
  | "storeDetails"
  | "logoDialogOpen"
  | "setLogoDialogOpen"
  | "locationDialogOpen"
  | "setLocationDialogOpen"
  | "updateStoreLocation"
  | "hasStoreChanges"
  | "saveStoreSettings"
  | "isSaving"
>;

const GeneralSettingsContent = (props: Props) => {
  const {
    storeForm,
    handleStoreInputChange,
    hasStoreChanges,
    saveStoreSettings,
    isSaving,
    updateStoreField,
    storeDetails,
    logoDialogOpen,
    setLogoDialogOpen,
    locationDialogOpen,
    setLocationDialogOpen,
    updateStoreLocation,
  } = props;

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-4 xl:grid-cols-12 xl:h-[calc(100dvh-11rem)]">
        <div className="flex min-h-0 xl:col-span-5">
          <BasicStoreInfoSection
            storeForm={storeForm}
            updateStoreField={updateStoreField}
            handleStoreInputChange={handleStoreInputChange}
            storeDetails={storeDetails}
            logoDialogOpen={logoDialogOpen}
            setLogoDialogOpen={setLogoDialogOpen}
            locationDialogOpen={locationDialogOpen}
            setLocationDialogOpen={setLocationDialogOpen}
            updateStoreLocation={updateStoreLocation}
          />
        </div>

        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto xl:col-span-7 xl:h-full xl:overflow-y-auto">
          <StoreAppearanceSection />
          <DeliveryNotesSection
            storeForm={storeForm}
            handleStoreInputChange={handleStoreInputChange}
          />
          <ProductsInventorySection
            storeForm={storeForm}
            updateStoreField={updateStoreField}
            handleStoreInputChange={handleStoreInputChange}
          />
          <OrdersSection
            storeForm={storeForm}
            updateStoreField={updateStoreField}
            handleStoreInputChange={handleStoreInputChange}
          />
        </div>
      </div>

      {hasStoreChanges && (
        <div className="flex shrink-0 justify-end">
          <Button
            className="gap-2 rounded-full px-6 shadow-lg"
            onClick={saveStoreSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="size-4" />
                حفظ الإعدادات
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GeneralSettingsContent;
