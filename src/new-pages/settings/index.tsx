import { Loader2 } from "lucide-react";
import TitleBar from "@/components/table/title-bar";
import SwitchTab from "@/components/table/switch-tab";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSettingsPage } from "@/hooks/use-settings-page";
import StoreSettingsContent from "./components/StoreSettingsContent";
import GeneralSettingsContent from "./components/GeneralSettingsContent";
import {
  Settings01Icon,
  Store01Icon,
} from "@hugeicons-pro/core-duotone-rounded";

const SettingsPage = () => {
  const actions = useSettingsPage();

  if (actions.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-4 pb-4">
      <TitleBar description="يمكنك تعديل تفاصيل وإعدادات المتجر المخصص لك">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SwitchTab
            selected={actions.activeTab}
            onChange={(value) =>
              actions.handleTabChange(value as "general" | "store")
            }
            options={[
              {
                label: "أعدادات العامة",
                value: "general",
                icon: Settings01Icon,
              },
              {
                label: "أعدادات المتجر",
                value: "store",
                icon: Store01Icon,
              },
            ]}
          />
        </div>
      </TitleBar>
      {actions.activeTab === "store" ? (
        <StoreSettingsContent />
      ) : (
        <GeneralSettingsContent
          storeForm={actions.storeForm}
          updateStoreField={actions.updateStoreField}
          handleStoreInputChange={actions.handleStoreInputChange}
          storeDetails={actions.storeDetails}
          logoDialogOpen={actions.logoDialogOpen}
          setLogoDialogOpen={actions.setLogoDialogOpen}
          locationDialogOpen={actions.locationDialogOpen}
          setLocationDialogOpen={actions.setLocationDialogOpen}
          updateStoreLocation={actions.updateStoreLocation}
          hasStoreChanges={actions.hasStoreChanges}
          saveStoreSettings={actions.saveStoreSettings}
          isSaving={actions.isSaving}
        />
      )}
    </div>
  );
};

export default SettingsPage;
