import StoreIntegrationsSection from "./StoreIntegrationsSection";
import PoliciesSection from "./PoliciesSection";
import StorePixelsSection from "./StorePixelsSection";

/** The plan moved to its own settings tab, «الاشتراك». */
const StoreSettingsContent = () => {
  return (
    <div className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-12">
      <div className="space-y-4 xl:col-span-4">
        <StoreIntegrationsSection />
        <StorePixelsSection />
      </div>

      <div className="flex flex-col gap-[18px] xl:col-span-8">
        <PoliciesSection />
      </div>
    </div>
  );
};

export default StoreSettingsContent;
