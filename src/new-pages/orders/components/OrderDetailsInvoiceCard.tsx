/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  useUpdateDeliveryAddress,
  useUpdateOrder,
} from "@/api/wrappers/order.wrappers";
import { useFetchStates } from "@/api/wrappers/state.wrappers";
import { useFetchRegionsByState } from "@/api/wrappers/region.wrappers";
import { getOrderPaymentLabel } from "../utils";

type Props = {
  order: any;
  onSaved?: () => void;
};

function localizedName(name: unknown): string {
  if (typeof name === "string") return name.trim();
  if (name && typeof name === "object") {
    const n = name as Record<string, string | undefined>;
    return (
      n.arabic?.trim() || n.ar?.trim() || n.english?.trim() || n.en?.trim() || ""
    );
  }
  return "";
}

/** A labelled pill, the shape every field in the Figma card uses. */
const Field = ({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("min-w-0 text-right", className)}>
    <p className="mb-2 text-[13px] text-slate-500 dark:text-[#a4b1fa]">
      {label}
    </p>
    {children}
  </div>
);

const pillClass =
  "flex h-12 w-full items-center rounded-[14px] bg-slate-50 px-4 text-sm text-slate-800 dark:bg-[#12183b] dark:text-[#e4e7fc]";

const ReadOnly = ({ value, ltr }: { value?: string | null; ltr?: boolean }) => (
  <div className={pillClass}>
    <span className="truncate" dir={ltr ? "ltr" : undefined}>
      {value?.trim() || "—"}
    </span>
  </div>
);

/**
 * تفاصيل الفاتورة — the customer and the address the parcel goes to.
 *
 * The address half is editable because the platform already has a route for
 * it (`update-delivery-address`); the customer and the payment method are
 * read-only, because nothing in the platform can change them and a control
 * that cannot act is worse than none.
 */
const OrderDetailsInvoiceCard = ({ order, onSaved }: Props) => {
  const customer = order?.customer?.user;
  const payment = getOrderPaymentLabel(order);

  const [stateId, setStateId] = useState<string>(order?.stateId ?? "");
  const [regionId, setRegionId] = useState<string>(order?.regionId ?? "");
  const [nearestPoint, setNearestPoint] = useState<string>(
    order?.nearest_point ?? "",
  );
  const [note, setNote] = useState<string>(order?.note ?? "");

  // A different order in the same drawer must not inherit the last one's edits.
  useEffect(() => {
    setStateId(order?.stateId ?? "");
    setRegionId(order?.regionId ?? "");
    setNearestPoint(order?.nearest_point ?? "");
    setNote(order?.note ?? "");
  }, [order?.id, order?.stateId, order?.regionId, order?.nearest_point, order?.note]);

  const { data: states } = useFetchStates(undefined, true);
  const { data: regions } = useFetchRegionsByState(stateId, !!stateId);

  const { mutate: updateAddress, isPending: isSavingAddress } =
    useUpdateDeliveryAddress(order?.id ?? "");
  const { mutate: updateOrder, isPending: isSavingNote } = useUpdateOrder();
  const isSaving = isSavingAddress || isSavingNote;

  const stateList: any[] = Array.isArray(states) ? states : (states?.data ?? []);
  const regionList: any[] = Array.isArray(regions)
    ? regions
    : (regions?.data ?? []);

  const addressDirty =
    (order?.stateId ?? "") !== stateId ||
    (order?.regionId ?? "") !== regionId ||
    (order?.nearest_point ?? "") !== nearestPoint;
  const noteDirty = (order?.note ?? "") !== note;
  const dirty = addressDirty || noteDirty;

  const stateLabel = useMemo(
    () =>
      localizedName(stateList.find((s) => s?.id === stateId)?.name) ||
      localizedName(order?.state?.name),
    [stateList, stateId, order?.state?.name],
  );
  const regionLabel = useMemo(
    () =>
      localizedName(regionList.find((r) => r?.id === regionId)?.name) ||
      localizedName(order?.region?.name),
    [regionList, regionId, order?.region?.name],
  );

  const handleSave = () => {
    if (!order?.id || !dirty) return;

    const done = () => {
      toast.success("تم حفظ التعديلات");
      onSaved?.();
    };

    if (addressDirty) {
      updateAddress(
        {
          stateId: stateId || undefined,
          regionId: regionId || undefined,
          nearest_point: nearestPoint || undefined,
        },
        {
          onSuccess: () => {
            if (!noteDirty) done();
          },
          onError: (err: any) =>
            toast.error(
              err?.response?.data?.message || "فشل تحديث عنوان التوصيل",
            ),
        },
      );
    }

    if (noteDirty) {
      updateOrder(
        { id: order.id, data: { note } },
        {
          onSuccess: done,
          onError: (err: any) =>
            toast.error(err?.response?.data?.message || "فشل حفظ الملاحظات"),
        },
      );
    }
  };

  const selectClass = cn(
    pillClass,
    "appearance-none cursor-pointer pl-10 outline-none focus-visible:ring-2 focus-visible:ring-[#00b7ff]/30",
  );

  return (
    <section className="rounded-[24px] bg-white p-4 sm:p-5 dark:bg-[#0a0e27]">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-[#e4e7fc]">
          تفاصيل الفاتورة
        </h2>
        {/* Figma shows the payment method as a pill with a switch beside it —
            a statement of how this order pays, not a control. */}
        <div
          className={cn(
            "flex items-center gap-2 rounded-full px-2 py-1.5",
            "bg-amber-500/10 dark:bg-[rgba(245,123,0,0.12)]",
          )}
        >
          <Switch checked disabled className="pointer-events-none" />
          <span className={cn("px-1 text-xs font-medium", payment.className)}>
            {payment.label}
          </span>
        </div>
      </header>

      {/* The mobile frame stacks these the other way up — طريقة الدفع at the
          top, اسم العميل at the bottom — which is the desktop row read from
          its left end. `flex-col-reverse` reproduces that without a second
          copy of the fields. */}
      <div className="flex flex-col-reverse gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4">
        <Field label="اسم العميل">
          <ReadOnly value={customer?.name} />
        </Field>
        <Field label="رقم الهاتف">
          <ReadOnly value={customer?.phone} ltr />
        </Field>
        <Field label="البريد الالكتروني">
          <ReadOnly value={customer?.email} ltr />
        </Field>
        <Field label="طريقة الدفع">
          <ReadOnly value={payment.label} />
        </Field>

        <Field label="المحافظة">
          <div className="relative">
            <select
              value={stateId}
              onChange={(e) => {
                setStateId(e.target.value);
                setRegionId("");
              }}
              disabled={isSaving}
              className={selectClass}
              aria-label="المحافظة"
            >
              <option value="">{stateLabel || "اختر المحافظة"}</option>
              {stateList.map((s) => (
                <option key={s.id} value={s.id}>
                  {localizedName(s.name)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#00b7ff]" />
          </div>
        </Field>
        <Field label="المنطقة">
          <div className="relative">
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              disabled={isSaving || !stateId}
              className={selectClass}
              aria-label="المنطقة"
            >
              <option value="">{regionLabel || "اختر المنطقة"}</option>
              {regionList.map((r) => (
                <option key={r.id} value={r.id}>
                  {localizedName(r.name)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#00b7ff]" />
          </div>
        </Field>
        <Field label="اقرب نقطة دالة">
          <input
            value={nearestPoint}
            onChange={(e) => setNearestPoint(e.target.value)}
            disabled={isSaving}
            placeholder="اكتب اقرب نقطة دالة"
            className={cn(
              pillClass,
              "outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#00b7ff]/30 dark:placeholder:text-[#4a5596]",
            )}
          />
        </Field>
        <Field label="الملاحظات">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isSaving}
            placeholder="اكتب ملاحظات اضافية للسائق"
            className={cn(
              pillClass,
              "outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#00b7ff]/30 dark:placeholder:text-[#4a5596]",
            )}
          />
        </Field>
      </div>

      {/* Saving is an act: an address that rewrites itself on blur is how a
          parcel quietly goes to the wrong district. */}
      {dirty ? (
        <div className="mt-5 flex justify-start">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex h-11 items-center justify-center gap-2 rounded-[14px] bg-linear-to-l from-[#b282ff] to-[#33c5ff] px-6 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
            حفظ التعديلات
          </button>
        </div>
      ) : null}
    </section>
  );
};

export default OrderDetailsInvoiceCard;
