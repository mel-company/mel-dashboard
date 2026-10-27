import {
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Ban,
  ExternalLink,
  Loader2,
  Printer,
  RefreshCw,
  Route,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import {
  useActiveCourier,
  useCancelShipment,
  useCreateShipment,
  useOrderShipment,
  useOrderTracking,
  useShipmentLabel,
  useSyncShipment,
} from "@/api/wrappers/shipping.wrappers";
import type {
  CourierShipmentStatus,
  CreateShipmentOptions,
} from "@/api/types/shipping";
import {
  formatCourierStatusLabel,
  isParcelLive,
  PARCEL_TERMINAL_STATUSES,
} from "@/api/types/shipping";
import { formatCurrency, AR_LATN_LOCALE } from "@/utils/format-currency";
import { cn } from "@/lib/utils";
import Ltr from "@/components/Ltr";
import { usePlanFeature } from "@/hooks/use-plan-limits";
import { PlanFeatureUpgrade } from "@/components/plan/PlanFeatureUpgrade";

/**
 * شحن الطلب — بأي شركة يستخدمها المتجر.
 *
 * - Buttons gated on `capabilities` so a 422 never looks like a broken UI.
 * - Dispatch costs money once a driver holds the parcel; the merchant asks
 *   via this card or the order «شحن الطلب» button (`useAutoDispatchOnShip`).
 */

function formatTrackingWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(AR_LATN_LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const STATUS_TONE: Record<CourierShipmentStatus, string> = {
  CREATED:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  PICKED_UP:
    "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  IN_TRANSIT:
    "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  OUT_FOR_DELIVERY:
    "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  DELIVERED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  RETURNED:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  CANCELLED:
    "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  FAILED: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  UNKNOWN:
    "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

/**
 * Al-Zaeem's sticker comes back as a `data:` URL, which browsers refuse to
 * open in a new tab. Turn it into a blob URL, and save it as a file when the
 * new tab is blocked.
 */
const openDataUrl = (dataUrl: string, fileName: string): void => {
  const [head, body = ""] = dataUrl.split(",", 2);
  const type = /^data:([^;,]+)/.exec(head)?.[1] ?? "application/pdf";
  const bytes = head.includes(";base64")
    ? Uint8Array.from(atob(body), (c) => c.charCodeAt(0))
    : new TextEncoder().encode(decodeURIComponent(body));
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  if (!window.open(url, "_blank")) {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  }
  // Give the new tab time to load it before the URL goes away.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

const apiError = (error: unknown, fallback: string): string => {
  const data = (
    error as {
      response?: {
        data?: {
          message?: unknown;
          errorMessage?: unknown;
          error?: { message?: unknown };
        };
      };
    }
  )?.response?.data;

  const message = data?.message ?? data?.errorMessage ?? data?.error?.message;
  const code = (data as { errorCode?: number | string } | undefined)?.errorCode;
  const text =
    typeof message === "string" && message.trim()
      ? message.trim()
      : Array.isArray(message) && message.length
        ? message.join("، ")
        : "";

  if (
    code === 4001 ||
    /unsupported document size/i.test(text)
  ) {
    return "حجم الملصق غير مدعوم لدى شركة الشحن. جرّب لاحقاً أو تواصل مع الدعم.";
  }
  if (text) return text;
  return fallback;
};

const Meta = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="min-w-0 rounded-[16px] bg-slate-50 px-3.5 py-3 dark:bg-[#12183b]">
    <p className="mb-1 text-[11px] text-slate-500 dark:text-[#a4b1fa]">
      {label}
    </p>
    <div className="truncate text-sm font-bold text-slate-900 dark:text-[#e4e7fc]">
      {children}
    </div>
  </div>
);

const ActionBtn = ({
  children,
  className,
  ...props
}: ComponentProps<typeof Button>) => (
  <Button
    variant="outline"
    size="sm"
    className={cn(
      // Explicit ink — outline alone was painting near-white text on white,
      // so «الملصق / عرض المسار / تحديث الحالة» vanished while سحب الطرد
      // (which sets its own rose colour) stayed readable.
      "h-10 flex-1 gap-1.5 rounded-[14px] border-slate-300 bg-white text-[13px] font-semibold text-slate-800 shadow-none",
      "hover:bg-slate-50 hover:text-slate-900",
      "dark:border-[#2a3160] dark:bg-[#0a0e27] dark:text-[#e4e7fc] dark:hover:bg-[#12183b]",
      className,
    )}
    {...props}
  >
    {children}
  </Button>
);

type Props = {
  order: Record<string, unknown>;
  onUpdated?: () => void;
  /**
   * Given by the order drawer, which owns the shipping steps. The card then
   * follows the order's status: nothing to do before «بدء المعالجة», the
   * parcel options while processing (sent by the drawer's «شحن الطلب»), and
   * the parcel itself once shipped. Withdrawing lives with the drawer's
   * actions too. Without it the card keeps its own buttons.
   */
  shipOptions?: CreateShipmentOptions;
  onShipOptionsChange?: (options: CreateShipmentOptions) => void;
};

const OrderShipmentCard = ({
  order,
  onUpdated,
  shipOptions,
  onShipOptionsChange,
}: Props) => {
  const orderId = String(order.id ?? "");

  const { data: courier, isLoading: courierLoading } = useActiveCourier();
  const { data: shipment, isLoading: shipmentLoading } =
    useOrderShipment(orderId);

  const [showTracking, setShowTracking] = useState(false);
  const { data: tracking, isFetching: trackingLoading } = useOrderTracking(
    orderId,
    showTracking,
  );

  const [ownOptions, setOwnOptions] = useState<CreateShipmentOptions>({});
  const statusDriven = !!onShipOptionsChange;
  const options = statusDriven ? (shipOptions ?? {}) : ownOptions;
  const setOptions = (
    update: (current: CreateShipmentOptions) => CreateShipmentOptions,
  ) =>
    statusDriven ? onShipOptionsChange(update(options)) : setOwnOptions(update);
  const orderStatus = String(order.status ?? "").toUpperCase();

  const createShipment = useCreateShipment(orderId);
  // Sending a parcel into the courier's system is a plan feature.
  const courierAllowed = usePlanFeature("courier_integrations");
  const syncShipment = useSyncShipment(orderId);
  const cancelShipment = useCancelShipment(orderId);
  const shipmentLabel = useShipmentLabel(orderId);

  const integrated = courier?.selected === true && courier.integrated === true;

  const showParcel =
    !!shipment &&
    !(
      statusDriven &&
      !isParcelLive(shipment) &&
      (orderStatus === "PENDING" || orderStatus === "PROCESSING")
    );

  const parcelCourier = shipment?.courier ?? null;
  const capabilities = showParcel && shipment
    ? (parcelCourier?.capabilities ?? null)
    : integrated
      ? courier.capabilities
      : null;

  const courierName = showParcel && shipment
    ? (parcelCourier?.displayName ?? shipment.courierCode)
    : integrated
      ? courier.deliveryCompanyName || courier.displayName
      : "";

  const parcelFromOtherCourier =
    !!shipment && integrated && shipment.courierCode !== courier.code;

  const feeGap = useMemo(() => {
    const paid = Number(order.deliveryFee ?? 0) || 0;
    const billed = shipment?.courierFee;
    if (billed === null || billed === undefined) return null;
    return { paid, billed, difference: billed - paid };
  }, [order.deliveryFee, shipment?.courierFee]);

  const run = async (
    work: Promise<unknown>,
    success: string,
    failure: string,
  ) => {
    try {
      await work;
      toast.success(success);
      onUpdated?.();
    } catch (error) {
      toast.error(apiError(error, failure));
    }
  };

  if (courierLoading || shipmentLoading) {
    return (
      <section className="rounded-[24px] bg-white p-5 dark:bg-[#0a0e27]">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#a4b1fa]">
          <Loader2 className="size-4 animate-spin" />
          جارٍ قراءة بيانات الشحن…
        </div>
      </section>
    );
  }

  if (!courier || courier.selected === false || courier.integrated === false) {
    return (
      <section className="rounded-[24px] bg-white p-5 dark:bg-[#0a0e27]">
        <header className="mb-3 flex items-center gap-2">
          <Truck className="size-4 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-[#e4e7fc]">
            الشحن
          </h3>
        </header>
        <p className="text-sm leading-relaxed text-slate-500 dark:text-[#a4b1fa]">
          {courier && courier.selected === false
            ? "لم تختر شركة شحن بعد. اخترها من الإعدادات لتتمكن من شحن الطلبات."
            : (courier?.reason ??
              "لا يمكن الشحن من هنا لهذا المتجر حاليًا.")}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] bg-white p-4 sm:p-5 dark:bg-[#0a0e27]">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-sky-50 text-sky-600 dark:bg-[#33c5ff]/10 dark:text-[#33c5ff]">
            <Truck className="size-4" />
          </span>
          <div className="min-w-0 text-right">
            <h3 className="truncate text-base font-bold text-slate-900 dark:text-[#e4e7fc]">
              الشحن عبر {courierName}
            </h3>
            {showParcel && shipment ? (
              <p className="mt-0.5 text-[11px] text-slate-400 dark:text-[#a4b1fa]">
                حالة الشركة:{" "}
                <span className="font-semibold text-slate-600 dark:text-[#e4e7fc]">
                  {formatCourierStatusLabel(shipment)}
                </span>
              </p>
            ) : null}
          </div>
        </div>
        {showParcel && shipment ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-bold",
              STATUS_TONE[shipment.status],
            )}
          >
            {formatCourierStatusLabel(shipment)}
          </span>
        ) : null}
      </header>

      <div className="space-y-4">
        {parcelFromOtherCourier ? (
          <div className="flex items-start gap-2 rounded-[16px] bg-sky-50 p-3.5 text-sm text-sky-900 dark:bg-sky-950/30 dark:text-sky-200">
            <Truck className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1 text-right">
              <p className="font-bold">
                هذا الطرد مع {courierName}، وليس شركتك الحالية
              </p>
              <p className="text-xs leading-relaxed opacity-90">
                تم شحنه قبل تغيير شركة التوصيل، ويبقى معها حتى يُسلَّم أو يُسحب.
                الطلبات الجديدة تُشحن عبر{" "}
                {courier.deliveryCompanyName || courier.displayName}.
              </p>
            </div>
          </div>
        ) : null}

        {!courier.companyActive ? (
          <div className="flex items-start gap-2 rounded-[16px] bg-amber-50 p-3.5 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1 text-right">
              <p className="font-bold">أوقفت المنصة التعامل مع {courierName}</p>
              <p className="text-xs leading-relaxed opacity-90">
                طلباتك الحالية تُشحن عبرها كما هي، لكنها لم تبقَ متاحة للاختيار —
                اختر شركة أخرى من الإعدادات.
              </p>
            </div>
          </div>
        ) : null}

        {!shipment && !courier.accountReady && courier.supportsBranches ? (
          <div className="flex items-start gap-2 rounded-[16px] bg-amber-50 p-3.5 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1 text-right">
              <p className="font-bold">
                لم يكتمل تسجيل المتجر لدى {courier.displayName}
              </p>
              <p className="text-xs leading-relaxed opacity-90">
                حدّد موقع الفرع من إعدادات التوصيل واحفظه ليُفتح فرعك تلقائياً.
              </p>
            </div>
          </div>
        ) : null}

        {!shipment && !courier.accountReady && !courier.supportsBranches ? (
          <div className="flex items-start gap-2 rounded-[16px] bg-amber-50 p-3.5 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1 text-right">
              <p className="font-bold">
                لا يمكن الشحن عبر {courier.displayName} بعد
              </p>
              <p className="text-xs leading-relaxed opacity-90">
                أكمل ربط حسابك لدى الشركة من إعدادات المتجر.
              </p>
            </div>
          </div>
        ) : null}

        {showParcel && shipment ? (
          <>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Meta label="رقم الطرد">
                <Ltr>{shipment.externalId ?? "—"}</Ltr>
              </Meta>
              <Meta label="رقمنا المرجعي">
                <Ltr>{shipment.reference ?? "—"}</Ltr>
              </Meta>
            </div>

            {feeGap ? (
              <div className="rounded-[16px] border border-slate-100 bg-slate-50/80 p-3.5 dark:border-[#1f2448] dark:bg-[#12183b]/60">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-bold text-slate-900 dark:text-[#e4e7fc]">
                    <Ltr>{formatCurrency(feeGap.paid)}</Ltr>
                  </span>
                  <span className="text-[13px] text-slate-500 dark:text-[#a4b1fa]">
                    دفع الزبون
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-2 text-sm dark:border-[#1f2448]">
                  <span className="font-bold text-slate-900 dark:text-[#e4e7fc]">
                    <Ltr>{formatCurrency(feeGap.billed)}</Ltr>
                  </span>
                  <span className="text-[13px] text-slate-500 dark:text-[#a4b1fa]">
                    تحاسبك الشركة
                  </span>
                </div>
                {feeGap.difference !== 0 ? (
                  <p
                    className={cn(
                      "mt-2.5 text-xs font-bold",
                      feeGap.difference > 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {feeGap.difference > 0
                      ? `الفرق عليك: ${formatCurrency(feeGap.difference)}`
                      : `الفرق لصالحك: ${formatCurrency(-feeGap.difference)}`}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {capabilities?.getShipment ? (
                <ActionBtn
                  disabled={syncShipment.isPending}
                  onClick={() =>
                    run(
                      syncShipment.mutateAsync(),
                      "تم تحديث حالة الطرد.",
                      "تعذر تحديث حالة الطرد.",
                    )
                  }
                >
                  {syncShipment.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="size-3.5" />
                  )}
                  تحديث الحالة
                </ActionBtn>
              ) : null}

              {capabilities?.track ? (
                <ActionBtn onClick={() => setShowTracking((v) => !v)}>
                  <Route className="size-3.5" />
                  {showTracking ? "إخفاء المسار" : "عرض المسار"}
                </ActionBtn>
              ) : null}

              {capabilities?.label ? (
                <ActionBtn
                  disabled={shipmentLabel.isPending}
                  onClick={async () => {
                    try {
                      // Prime accepts A5; A4 was the old default and 422s.
                      const result = await shipmentLabel.mutateAsync("A5");
                      if (result?.labelUrl?.startsWith("data:")) {
                        openDataUrl(result.labelUrl, `sticker-${orderId}.pdf`);
                      } else if (result?.labelUrl) {
                        window.open(result.labelUrl, "_blank", "noopener");
                      } else {
                        toast.error("لم تُرجع الشركة رابط ملصق.");
                      }
                    } catch (error) {
                      toast.error(apiError(error, "تعذر جلب الملصق."));
                    }
                  }}
                >
                  {shipmentLabel.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Printer className="size-3.5" />
                  )}
                  الملصق
                </ActionBtn>
              ) : null}

              {shipment.labelUrl && !shipment.labelUrl.startsWith("data:") ? (
                <ActionBtn asChild>
                  <a
                    href={shipment.labelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-3.5" />
                    صفحة التتبّع
                  </a>
                </ActionBtn>
              ) : null}

              {!statusDriven &&
              capabilities?.cancelShipment &&
              !PARCEL_TERMINAL_STATUSES.includes(shipment.status) ? (
                <ActionBtn
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                  disabled={cancelShipment.isPending}
                  onClick={() =>
                    run(
                      cancelShipment.mutateAsync(),
                      "تم سحب الطرد.",
                      "تعذر سحب الطرد.",
                    )
                  }
                >
                  {cancelShipment.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Ban className="size-3.5" />
                  )}
                  سحب الطرد
                </ActionBtn>
              ) : null}
            </div>

            {!parcelCourier ? (
              <p className="text-[11px] leading-relaxed text-slate-400 dark:text-[#a4b1fa]">
                لم يعد هذا الطرد مرتبطاً بتكامل فعّال ({shipment.courierCode}) —
                الأرقام أعلاه هي ما تحتاجه للاتصال بالشركة مباشرة.
              </p>
            ) : !capabilities?.cancelShipment &&
              !PARCEL_TERMINAL_STATUSES.includes(shipment.status) ? (
              <p className="text-[11px] leading-relaxed text-slate-400 dark:text-[#a4b1fa]">
                لا تدعم {courierName} سحب الطرد عبر النظام — اتصل بهم مباشرة.
              </p>
            ) : null}

            {showTracking ? (
              <div className="rounded-[16px] border border-slate-100 bg-slate-50/50 p-4 dark:border-[#1f2448] dark:bg-[#12183b]/40">
                <p className="mb-3 text-[13px] font-bold text-slate-800 dark:text-[#e4e7fc]">
                  مسار الطرد
                </p>
                {trackingLoading ? (
                  <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#a4b1fa]">
                    <Loader2 className="size-4 animate-spin" />
                    جارٍ قراءة المسار…
                  </p>
                ) : tracking && tracking.length > 0 ? (
                  <ol className="relative space-y-0 border-s-2 border-sky-200 ps-4 dark:border-sky-900/60">
                    {tracking.map((event, index) => (
                      <li
                        key={`${event.rawStatusCode ?? event.status}-${index}`}
                        className="relative pb-4 last:pb-0"
                      >
                        <span className="absolute -start-[21px] top-1.5 size-2.5 rounded-full border-2 border-white bg-sky-500 dark:border-[#0a0e27]" />
                        <p className="text-sm font-bold text-slate-900 dark:text-[#e4e7fc]">
                          {formatCourierStatusLabel(event)}
                        </p>
                        {event.occurredAt ? (
                          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-[#a4b1fa]">
                            {formatTrackingWhen(event.occurredAt)}
                          </p>
                        ) : null}
                        {event.note ? (
                          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-[#a4b1fa]">
                            {event.note}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-[#a4b1fa]">
                    لا يوجد مسار مسجَّل لهذا الطرد.
                  </p>
                )}
              </div>
            ) : null}
          </>
        ) : statusDriven &&
          (orderStatus === "PENDING" ||
            orderStatus === "DELIVERED" ||
            orderStatus === "CANCELLED") ? (
          <p className="text-sm leading-relaxed text-slate-500 dark:text-[#a4b1fa]">
            {orderStatus === "PENDING"
              ? `ابدأ معالجة الطلب أولاً، ثم يُسجَّل الطرد لدى ${courierName} من زر «شحن الطلب».`
              : orderStatus === "CANCELLED"
                ? "الطلب ملغى، فلا طرد لتسجيله."
                : "سُلّم الطلب دون طرد مسجّل لدى شركة الشحن."}
          </p>
        ) : (
          <>
            {statusDriven && shipment ? (
              <p className="text-xs leading-relaxed text-slate-400 dark:text-[#a4b1fa]">
                سُحب الطرد السابق (<Ltr>{shipment.externalId ?? "—"}</Ltr>).
              </p>
            ) : null}
            <p className="text-sm leading-relaxed text-slate-500 dark:text-[#a4b1fa]">
              {statusDriven && orderStatus === "PROCESSING"
                ? `يُسجَّل الطرد لدى ${courierName} عند الضغط على «شحن الطلب».`
                : "لم يُسجَّل هذا الطلب لدى شركة الشحن بعد. يمكنك تسجيله من هنا أو من زر «شحن الطلب» أعلى الإجراءات."}
            </p>

            {courier.code === "boxy" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">حجم الطرد</Label>
                  <Select
                    value={options.size ?? "M"}
                    onValueChange={(value) =>
                      setOptions((current) => ({
                        ...current,
                        size: value as "S" | "M" | "L",
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1 h-11 rounded-[14px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S">صغير</SelectItem>
                      <SelectItem value="M">متوسط</SelectItem>
                      <SelectItem value="L">كبير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <label className="flex h-11 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={options.isFragile ?? false}
                      onChange={(event) =>
                        setOptions((current) => ({
                          ...current,
                          isFragile: event.target.checked,
                        }))
                      }
                      className="size-4 rounded"
                    />
                    قابل للكسر
                  </label>
                </div>
              </div>
            ) : null}

            {courier.code === "modon" || courier.code === "alwaseet" ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={options.replacement ?? false}
                  onChange={(event) =>
                    setOptions((current) => ({
                      ...current,
                      replacement: event.target.checked,
                    }))
                  }
                  className="size-4 rounded"
                />
                طرد استبدال
              </label>
            ) : null}

            {!courierAllowed ? (
              <PlanFeatureUpgrade feature="courier_integrations" />
            ) : statusDriven && orderStatus === "PROCESSING" ? null : (
            <Button
              className="h-12 w-full gap-2 rounded-[14px] text-base font-bold"
              disabled={createShipment.isPending || !courier.accountReady}
              onClick={() =>
                run(
                  createShipment.mutateAsync({ options }),
                  "تم تسجيل الطرد لدى شركة الشحن.",
                  "تعذر تسجيل الطرد.",
                )
              }
            >
              {createShipment.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Truck className="size-4" />
              )}
              تسجيل الطرد لدى {courier.displayName}
            </Button>
            )}

            {!capabilities?.quote ? (
              <p className="text-[11px] leading-relaxed text-slate-400 dark:text-[#a4b1fa]">
                لا تعطي {courier.displayName} سعراً قبل التسجيل — تظهر الأجرة
                الفعلية بعد شحن الطلب.
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
};

export default OrderShipmentCard;
