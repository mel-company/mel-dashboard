import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Store, MapPin } from "lucide-react";
import { getImageUrl } from "@/utils/image-url";
import SettingsCard from "./SettingsCard";
import {
  SettingsField,
  SettingsInput,
  SettingsLabel,
  SettingsPhoneInput,
  SettingsTextarea,
} from "./SettingsField";
import type { useSettingsPage } from "@/hooks/use-settings-page";
import LogoDialog from "@/pages/settings/LogoDialog";
import LocationDialog from "@/pages/settings/LocationDialog";
import StoreMapPreview from "./StoreMapPreview";

const compactInputClass = "h-10";

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
>;

const BasicStoreInfoSection = ({
  storeForm,
  updateStoreField,
  handleStoreInputChange,
  storeDetails,
  logoDialogOpen,
  setLogoDialogOpen,
  locationDialogOpen,
  setLocationDialogOpen,
  updateStoreLocation,
}: Props) => {
  const [logoError, setLogoError] = useState(false);
  const storeLogoUrl = getImageUrl(storeDetails?.logo, storeDetails?.baseUrl);
  const showStoreLogo = Boolean(storeLogoUrl) && !logoError;
  const mapLat = storeForm.latitude ?? 33.3152;
  const mapLng = storeForm.longitude ?? 44.3661;

  const openLocationDialog = () => setLocationDialogOpen(true);

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <SettingsCard
        title="معلومات المتجر الاساسية"
        className="flex h-full min-h-0 w-full flex-col overflow-hidden"
        bodyClassName="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto"
      >
        <div
          className="relative h-[142px] w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900/60"
          role="button"
          tabIndex={0}
          onClick={() => setLogoDialogOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setLogoDialogOpen(true);
            }
          }}
        >
          {showStoreLogo ? (
            <img
              src={storeLogoUrl}
              alt="شعار المتجر"
              className="size-full object-contain p-4"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Store className="size-16 text-orange-500 opacity-90" />
            </div>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute bottom-3 left-3 rounded-lg bg-sky-500/10 px-4 text-[13px] text-sky-500 hover:bg-sky-500/20"
            onClick={(e) => {
              e.stopPropagation();
              setLogoDialogOpen(true);
            }}
          >
            تغيير الصورة
          </Button>
        </div>

        <SettingsField label="اسم المتجر" htmlFor="storeName" className="shrink-0">
          <SettingsInput
            id="storeName"
            name="storeName"
            value={storeForm.storeName}
            onChange={handleStoreInputChange}
            className={compactInputClass}
          />
        </SettingsField>

        <SettingsField
          label="وصف المتجر"
          htmlFor="storeDescription"
          className="shrink-0"
        >
          <SettingsTextarea
            id="storeDescription"
            name="storeDescription"
            value={storeForm.storeDescription}
            onChange={handleStoreInputChange}
            rows={4}
            className="min-h-[112px] max-h-[112px] resize-none text-sm leading-snug"
          />
        </SettingsField>

        <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2">
          <SettingsField label="رقم الهاتف" htmlFor="businessPhone">
            <SettingsPhoneInput
              id="businessPhone"
              name="businessPhone"
              value={storeForm.businessPhone}
              onChange={handleStoreInputChange}
            />
          </SettingsField>

          <SettingsField label="البريد الالكتروني" htmlFor="businessEmail">
            <SettingsInput
              id="businessEmail"
              name="businessEmail"
              type="email"
              placeholder="example@example.com"
              value={storeForm.businessEmail}
              onChange={handleStoreInputChange}
              dir="ltr"
              className={`text-center ${compactInputClass}`}
            />
          </SettingsField>
        </div>

        <div className="shrink-0 space-y-2">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0 text-red-500" />
              <SettingsLabel className="mb-0">موقع المتجر</SettingsLabel>
            </div>
            <Switch
              checked={storeForm.isPhysicalStore}
              activeLabel="مفعل"
              disabledLabel="معطل"
              onToggle={(checked) =>
                updateStoreField("isPhysicalStore", checked)
              }
            />
          </div>

          {storeForm.isPhysicalStore && (
            <>
              <div
                className="relative h-24 cursor-pointer overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 dark:ring-1 dark:ring-slate-800"
                role="button"
                tabIndex={0}
                onClick={openLocationDialog}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLocationDialog();
                  }
                }}
              >
                <div className="pointer-events-none absolute inset-0">
                  <StoreMapPreview lat={mapLat} lng={mapLng} />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 left-2 z-10 rounded-lg bg-white/95 px-3 text-xs text-sky-700 shadow-sm hover:bg-white dark:bg-slate-900/95 dark:text-sky-300 dark:hover:bg-slate-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLocationDialog();
                  }}
                >
                  تغيير الموقع
                </Button>
              </div>
              <SettingsTextarea
                id="physicalAddress"
                name="physicalAddress"
                value={storeForm.physicalAddress}
                onChange={handleStoreInputChange}
                placeholder="أدخل عنوان المتجر"
                rows={2}
                className="min-h-[48px]"
              />
            </>
          )}
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2">
          <SettingsField label="وقت بدء العمل" htmlFor="workStartTime">
            <SettingsInput
              id="workStartTime"
              name="workStartTime"
              type="time"
              value={storeForm.workStartTime}
              onChange={handleStoreInputChange}
              className={compactInputClass}
            />
          </SettingsField>
          <SettingsField label="وقت انتهاء العمل" htmlFor="workEndTime">
            <SettingsInput
              id="workEndTime"
              name="workEndTime"
              type="time"
              value={storeForm.workEndTime}
              onChange={handleStoreInputChange}
              className={compactInputClass}
            />
          </SettingsField>
        </div>
      </SettingsCard>

      <LogoDialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen} />
      <LocationDialog
        open={locationDialogOpen}
        onOpenChange={setLocationDialogOpen}
        latitude={storeForm.latitude}
        longitude={storeForm.longitude}
        address={storeForm.physicalAddress}
        onConfirm={updateStoreLocation}
      />
    </div>
  );
};

export default BasicStoreInfoSection;
