import { useMemo, useState } from "react";
import { CheckCircle2, Info, MapPin } from "lucide-react";
import { toast } from "sonner";
import LocationDialog from "@/pages/settings/LocationDialog";
import StoreMapPreview from "./StoreMapPreview";
import {
  useCourierBranch,
  useSaveCourierBranch,
} from "@/api/wrappers/shipping.wrappers";
import { useFetchStates } from "@/api/wrappers/state.wrappers";
import { useFetchRegions } from "@/api/wrappers/region.wrappers";

/** Names come back as `{ ar, en }` JSON, or a bare string on older rows. */
const placeName = (name: unknown): string => {
  if (!name) return "";
  if (typeof name === "string") return name;
  const n = name as Record<string, string | undefined>;
  return n.ar || n.en || n.arabic || n.english || "";
};

type Place = { id: string; name?: unknown };

const asList = (value: unknown): Place[] =>
  Array.isArray(value)
    ? value
    : ((value as { data?: Place[] } | undefined)?.data ?? []);

/**
 * موقع الفرع — where a driver collects this store's parcels.
 *
 * The merchant picks the province and city, then places the pin on a map.
 * Saving records it on the store (the origin half of every delivery price) and,
 * for a courier whose API opens branches from coordinates — Prime and Boxy —
 * the server opens the branch there or moves the existing one. Modon Express
 * and Al-Waseet have no branch API, so for them only the location is kept.
 *
 * Replaces two bare province/city selects, which priced deliveries but never
 * told the courier where to collect from: Prime branches were opened from the
 * dashboard with fixed coordinates, and Boxy's needed an operator.
 */
const BranchLocationField = () => {
  const { data: branch } = useCourierBranch();
  const saveBranch = useSaveCourierBranch();
  const [open, setOpen] = useState(false);

  const location = branch?.location;
  const courier = branch?.courier ?? null;
  const hasPin = location?.latitude != null && location?.longitude != null;

  const { data: statesData } = useFetchStates();
  const { data: regionsData } = useFetchRegions(
    location?.stateId ?? "",
    !!location?.stateId,
  );
  const placeLabel = useMemo(() => {
    const state = asList(statesData).find((s) => s.id === location?.stateId);
    const region = asList(regionsData).find((r) => r.id === location?.regionId);
    return [placeName(region?.name), placeName(state?.name)]
      .filter(Boolean)
      .join("، ");
  }, [statesData, regionsData, location?.stateId, location?.regionId]);

  const save = (data: {
    latitude: number;
    longitude: number;
    address: string;
    stateId: string;
    regionId: string;
  }) => {
    saveBranch.mutate(
      {
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        // Untouched list keeps the store's current province and city.
        ...(data.stateId
          ? { stateId: data.stateId, regionId: data.regionId || undefined }
          : {}),
      },
      {
        onSuccess: (result) => {
          setOpen(false);
          const name = result.courier?.displayName;
          toast.success(
            result.courier?.opensBranch && name
              ? result.branch?.updated
                ? `تم تحديث موقع فرعك لدى ${name}`
                : `تم فتح فرعك لدى ${name}`
              : "تم حفظ موقع الفرع",
          );
        },
        onError: (error) => {
          const message = (
            error as { response?: { data?: { message?: unknown } } }
          )?.response?.data?.message;
          toast.error(
            typeof message === "string" && message.trim()
              ? message
              : Array.isArray(message)
                ? message.join(" — ")
                : "تعذر حفظ موقع الفرع",
          );
        },
      },
    );
  };

  return (
    <div className="mt-4 space-y-2">
      <p className="px-1 text-sm font-medium text-slate-900 dark:text-slate-100">
        موقع الفرع
      </p>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative block h-28 w-full overflow-hidden rounded-[14px] bg-slate-100 text-right dark:bg-slate-900"
      >
        {hasPin ? (
          <div className="pointer-events-none absolute inset-0">
            <StoreMapPreview lat={location!.latitude!} lng={location!.longitude!} />
          </div>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1 text-slate-500">
            <MapPin className="size-5 text-sky-500" />
            <span className="text-[13px]">حدّد موقع الفرع على الخريطة</span>
          </div>
        )}
        <span className="absolute bottom-2 left-2 z-10 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-medium text-sky-700 shadow-sm dark:bg-slate-900/95 dark:text-sky-300">
          {hasPin ? "تعديل الموقع" : "اختيار الموقع"}
        </span>
      </button>

      {(location?.address || placeLabel) && (
        <p className="px-1 text-[13px] text-slate-700 dark:text-slate-300">
          {[location?.address, placeLabel].filter(Boolean).join(" — ")}
        </p>
      )}

      {courier?.opensBranch ? (
        courier.hasBranch ? (
          <p className="flex items-center gap-1.5 px-1 text-[13px] text-emerald-700">
            <CheckCircle2 className="size-4 shrink-0" />
            فرعك مسجّل لدى {courier.displayName} — تعديل الموقع ينقله.
          </p>
        ) : (
          <p className="flex items-start gap-1.5 rounded-[12px] bg-sky-50 px-3 py-2 text-[13px] leading-relaxed text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
            <Info className="mt-0.5 size-4 shrink-0" />
            {hasPin
              ? `لم يُفتح فرعك لدى ${courier.displayName} بعد — احفظ الموقع مرة أخرى لفتحه.`
              : `عند حفظ الموقع يُفتح فرعك لدى ${courier.displayName} تلقائياً ليأتي المندوب لاستلام الطرود منه.`}
          </p>
        )
      ) : null}

      <p className="px-1 text-[13px] text-slate-500">
        تُستخدم لحساب أجور التوصيل — التوصيل داخل نفس المحافظة يُحسب بسعر
        مختلف.
      </p>

      <LocationDialog
        open={open}
        onOpenChange={setOpen}
        title="موقع الفرع"
        confirmLabel={
          courier?.opensBranch
            ? courier.hasBranch
              ? "حفظ ونقل الفرع"
              : "حفظ وفتح الفرع"
            : "حفظ الموقع"
        }
        latitude={location?.latitude ?? null}
        longitude={location?.longitude ?? null}
        address={location?.address ?? ""}
        initialStateId={location?.stateId}
        initialRegionId={location?.regionId}
        requireState
        busy={saveBranch.isPending}
        keepOpenOnConfirm
        onConfirm={save}
      />
    </div>
  );
};

export default BranchLocationField;
