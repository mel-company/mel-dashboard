import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Store, MapPin } from "lucide-react";
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

const compactInputClass = "h-10";
const compactTextareaClass = "min-h-0";

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
  const mapLat = storeForm.latitude ?? 33.3152;
  const mapLng = storeForm.longitude ?? 44.3661;
  const mapBbox = `${mapLng - 0.015},${mapLat - 0.01},${mapLng + 0.015},${mapLat + 0.01}`;

  const openLocationDialog = () => setLocationDialogOpen(true);

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <SettingsCard
        title="معلومات المتجر الأساسية"
        className="flex h-full min-h-0 w-full flex-col overflow-hidden"
        bodyClassName="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden"
      >
        <div
          className="relative h-20 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900/60"
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
          {storeDetails?.logo ? (
            <img
              src={storeDetails.logo}
              alt="شعار المتجر"
              className="size-full object-contain p-3"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Store className="size-10 text-orange-500 opacity-90" />
            </div>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute bottom-2 left-2 rounded-lg bg-sky-100 px-3 text-xs text-sky-600 hover:bg-sky-200"
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
          className="flex min-h-0 flex-1 flex-col"
        >
          <SettingsTextarea
            id="storeDescription"
            name="storeDescription"
            value={storeForm.storeDescription}
            onChange={handleStoreInputChange}
            rows={2}
            className={`${compactTextareaClass} min-h-0 flex-1`}
          />
        </SettingsField>

        <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2">
          <SettingsField label="رقم الهاتف" htmlFor="businessPhone">
            <SettingsPhoneInput
              id="businessPhone"
              name="businessPhone"
              value={storeForm.businessPhone}
              onChange={handleStoreInputChange}
              placeholder="0771 345 1330"
              className="h-10"
            />
          </SettingsField>

          <SettingsField label="البريد الالكتروني" htmlFor="businessEmail">
            <SettingsInput
              id="businessEmail"
              name="businessEmail"
              type="email"
              value={storeForm.businessEmail}
              onChange={handleStoreInputChange}
              dir="ltr"
              className={`text-center ${compactInputClass}`}
            />
          </SettingsField>
        </div>

        <div className="shrink-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <SettingsLabel>متجر فعلي</SettingsLabel>
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
              <SettingsLabel>موقع المتجر</SettingsLabel>
              <div
                className="relative h-16 cursor-pointer overflow-hidden rounded-xl bg-slate-100"
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
                <iframe
                  title="معاينة موقع المتجر"
                  className="pointer-events-none absolute inset-0 size-full border-0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapBbox}&layer=mapnik&marker=${mapLat}%2C${mapLng}`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="size-6 text-red-500 drop-shadow" />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-1.5 left-1.5 z-10 h-7 rounded-lg bg-sky-100 px-2 text-[10px] text-sky-600 hover:bg-sky-200"
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
                rows={1}
                className="min-h-10"
              />
            </>
          )}
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2">
          <SettingsField label="وقت البدء بالعمل" htmlFor="workStartTime">
            <SettingsInput
              id="workStartTime"
              name="workStartTime"
              type="time"
              value={storeForm.workStartTime}
              onChange={handleStoreInputChange}
              className={compactInputClass}
            />
          </SettingsField>
          <SettingsField label="وقت الانتهاء بالعمل" htmlFor="workEndTime">
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
