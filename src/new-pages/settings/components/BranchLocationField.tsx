import { useMemo, useState } from "react";
import { CheckCircle2, Info, MapPin } from "lucide-react";
import { toast } from "sonner";
import LocationDialog from "@/pages/settings/LocationDialog";
import StoreMapPreview from "./StoreMapPreview";
import {
  useCourierBranch,
  useSaveCourierBranch,
} from "@/api/wrappers/shipping.wrappers";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import { useFetchStates } from "@/api/wrappers/state.wrappers";
import { useFetchRegions } from "@/api/wrappers/region.wrappers";

/** Names come back as `{ ar, en }` JSON, or a bare string on older rows. */
const placeName = (name: unknown): string => {
  if (!name) return "";
  if (typeof name === "string") return name;
  const n = name as Record<string, string | undefined>;
  return n.ar || n.en || n.arabic || n.english || "";
};

/**
 * Server 422s for branch open are often English ops copy — merchants need a
 * clear next step in Arabic, not "Shipping → zones".
 */
const merchantBranchSaveError = (message: unknown): string => {
  const raw = Array.isArray(message)
    ? message.join(" — ")
    : typeof message === "string"
      ? message.trim()
      : "";
  if (!raw) return "تعذر حفظ موقع الفرع";

  const lower = raw.toLowerCase();
  if (
    lower.includes("province and district mapped") ||
    lower.includes("shipping → zones") ||
    lower.includes("shipping -> zones")
  ) {
    return "هذه المحافظة/المنطقة غير مربوطة بعد برموز شركة التوصيل. تواصل مع الدعم لربط المناطق، ثم أعد الحفظ.";
  }
  if (
    lower.includes("phone") ||
    raw.includes("رقم هاتف المتجر") ||
    raw.includes("أضف رقم هاتف")
  ) {
    return "أضف رقم هاتف المتجر من الإعدادات العامة أولاً، ثم أعد حفظ موقع الفرع.";
  }
  return raw;
};

const hasStorePhone = (phone: unknown): boolean => {
  if (typeof phone !== "string") return false;
  return phone.replace(/\D/g, "").length >= 10;
};

type Place = { id: string; name?: unknown };

const asList = (value: unknown): Place[] =>
  Array.isArray(value)
    ? value
    : ((value as { data?: Place[] } | undefined)?.data ?? []);

type Props = {
  /** Controlled open — used when the Prime checklist jumps here. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * موقع الفرع — where a driver collects this store's parcels.
 *
 * The merchant picks the province and city, then places the pin on a map.
 * Saving records it on the store (the origin half of every delivery price) and,
 * for a courier whose API opens branches from coordinates — Prime and Boxy —
 * the server opens the branch there or moves the existing one.
 */
const BranchLocationField = ({ open: openProp, onOpenChange }: Props) => {
  const { data: storeDetails } = useFetchStoreDetails();
  const { data: branch } = useCourierBranch();
  const saveBranch = useSaveCourierBranch();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const open = openProp ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (openProp === undefined) setUncontrolledOpen(next);
  };

  const location = branch?.location;
  const courier = branch?.courier ?? null;
  const hasPin = location?.latitude != null && location?.longitude != null;
  const phoneOk = hasStorePhone(storeDetails?.phone);

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
    if (!data.stateId || !data.regionId) {
      toast.error("اختر المحافظة والمنطقة قبل حفظ موقع الفرع");
      return;
    }

    if (courier?.opensBranch && !phoneOk) {
      const msg =
        "أضف رقم هاتف المتجر من الإعدادات العامة أولاً، ثم أعد حفظ موقع الفرع.";
      toast.error(msg);
      setLastError(msg);
      return;
    }

    saveBranch.mutate(
      {
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        stateId: data.stateId,
        regionId: data.regionId,
      },
      {
        onSuccess: (result) => {
          setOpen(false);
          setLastError(null);
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
          const friendly = merchantBranchSaveError(message);
          setLastError(friendly);
          toast.error(friendly);
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
        onClick={() => {
          setLastError(null);
          setOpen(true);
        }}
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
              ? `لم يُفتح فرعك لدى ${courier.displayName} بعد — اختر المحافظة والمنطقة واحفظ الموقع لفتحه.`
              : `اختر المحافظة والمنطقة ثم احفظ الموقع — يُفتح فرعك لدى ${courier.displayName} تلقائياً ليستلم المندوب الطرود منه.`}
          </p>
        )
      ) : null}

      {lastError && (
        <p className="rounded-[12px] bg-amber-50 px-3 py-2 text-[13px] leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {lastError}
        </p>
      )}

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
        requireRegion
        busy={saveBranch.isPending}
        keepOpenOnConfirm
        onConfirm={save}
      />
    </div>
  );
};

export default BranchLocationField;
