/* eslint-disable @typescript-eslint/no-explicit-any */
import OrderDetailsLocked from "@/components/plan/OrderDetailsLocked";
import {
  isSubscriptionExpiredError,
  usePlanUsage,
} from "@/hooks/use-plan-limits";
import { useEffect, useRef, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Loader2,
  Package,
  Printer,
  Truck,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  File01Icon,
  ShoppingBag01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SwitchTab from "@/components/table/switch-tab";
import StatusGlyph from "@/components/table/status-glyph";
import Ltr from "@/components/Ltr";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import {
  isParcelLive,
  type CreateShipmentOptions,
} from "@/api/types/shipping";
import {
  useFetchOrder,
  useFetchOrderLogs,
  useUpdateStatusToCancelled,
  useUpdateStatusToDelivered,
  useUpdateStatusToProcessing,
  useUpdateStatusToShipped,
} from "@/api/wrappers/order.wrappers";
import {
  useActiveCourier,
  useCancelShipment,
  useCreateShipment,
  useOrderShipment,
} from "@/api/wrappers/shipping.wrappers";
import { usePlanFeature } from "@/hooks/use-plan-limits";
import { useAutoDispatchOnShip } from "@/hooks/use-auto-dispatch-on-ship";
import { ORDER_INVOICE_PREVIEW_STORAGE_KEY } from "@/pages/order/OrderInvoicePreview";
import OrderShipmentCard from "@/pages/order/OrderShipmentCard";
import {
  formatOrderCode,
  formatOrderDateParts,
  getOrderStatusMeta,
} from "../utils";
import OrderDetailsInvoiceCard from "./OrderDetailsInvoiceCard";
import OrderDetailsItems from "./OrderDetailsItems";
import OrderDetailsTimeline from "./OrderDetailsTimeline";
import {
  OrderDeliveryCard,
  OrderFinancialCard,
} from "./OrderDetailsSummaryCards";

type StatusTarget = "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

function apiErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  if (typeof message !== "string" || !message.trim()) return fallback;

  // Ship/notify path: the order's customer id is not a store customer
  // (e.g. the merchant placed a test order as themselves). English 400s
  // used to surface as-is and looked like a broken ship button.
  if (/recipients do not belong to the store/i.test(message)) {
    return "لا يمكن شحن هذا الطلب: الزبون المرتبط به ليس عميلاً في المتجر. أنشئ طلباً من واجهة المتجر بحساب زبون حقيقي ثم أعد المحاولة.";
  }

  return message;
}

type Props = {
  /** The row that was opened. `null` keeps the drawer closed. */
  order: any | null;
  onOpenChange: (open: boolean) => void;
  imageBaseUrl?: string | null;
  calculateTotal?: (products: any[]) => number;
  /** Refresh the list behind the drawer after a status change. */
  onChanged?: () => void;
};

const MOBILE_TABS = [
  { label: "معلومات الطلب", value: "info", icon: File01Icon },
  { label: "منتجات الطلب", value: "items", icon: ShoppingBag01Icon },
];

const OrderDetailsSheet = ({
  order: seed,
  onOpenChange,
  imageBaseUrl,
  calculateTotal,
  onChanged,
}: Props) => {
  const isMobile = useIsMobile();
  const open = !!seed;
  const id = seed?.id ?? "";
  const [tab, setTab] = useState("info");
  /** Which confirm is open: cancelling the order, or withdrawing its parcel. */
  const [confirm, setConfirm] = useState<"cancel" | "withdraw" | null>(null);
  /** Boxy size / fragile, Modon replacement — sent with «شحن الطلب». */
  const [shipOptions, setShipOptions] = useState<CreateShipmentOptions>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // The row already carries enough to paint the header and the summary, so the
  // drawer opens filled; the detail call fills in lines, logs and the parcel.
  const { data: fresh, refetch, error: fetchError } = useFetchOrder(id, open);
  // Ended subscription: the server refuses the detail, and the row's own
  // fields stay hidden too rather than half an order showing.
  const { data: planUsage } = usePlanUsage(open);
  const locked =
    Boolean(planUsage?.subscription?.expired) ||
    isSubscriptionExpiredError(fetchError);
  const order = fresh ? { ...seed, ...fresh } : seed;

  const { data: logs, isLoading: isLoadingLogs } = useFetchOrderLogs(id, open);
  const { data: shipment } = useOrderShipment(id, open);
  const { data: courier } = useActiveCourier(open);
  const { dispatchIfNeeded, isDispatching } = useAutoDispatchOnShip(id, open);
  const courierAllowed = usePlanFeature("courier_integrations");
  const createShipment = useCreateShipment(id);
  const cancelShipment = useCancelShipment(id);
  const { mutate: toProcessing, isPending: isToProcessing } =
    useUpdateStatusToProcessing();
  const { mutate: toShipped, isPending: isToShipped } =
    useUpdateStatusToShipped();
  const { mutate: toDelivered, isPending: isToDelivered } =
    useUpdateStatusToDelivered();
  const { mutate: toCancelled, isPending: isToCancelled } =
    useUpdateStatusToCancelled();

  const isUpdatingStatus =
    isToProcessing ||
    isToShipped ||
    isToDelivered ||
    isToCancelled ||
    isDispatching ||
    createShipment.isPending ||
    cancelShipment.isPending;
  const liveParcel = shipment && isParcelLive(shipment) ? shipment : null;
  // Asked of the parcel's own courier, not the store's current one.
  const canWithdraw = !!liveParcel?.courier?.capabilities?.cancelShipment;
  const parcelCourierName =
    liveParcel?.courier?.displayName ?? liveParcel?.courierCode ?? "";
  /**
   * «شحن الطلب» registers the parcel first and only then marks the order
   * shipped, so a refused parcel leaves the order in «قيد المعالجة» instead
   * of «تم الشحن» with nothing on the van.
   */
  const dispatchFirst =
    courier?.selected === true &&
    courier.integrated === true &&
    courier.accountReady &&
    courierAllowed &&
    !liveParcel;

  useEffect(() => {
    if (!open) {
      setTab("info");
      setConfirm(null);
      setShipOptions({});
    }
  }, [open]);

  // Switching tabs keeps the scroll offset otherwise, so the products tab
  // opens half way down and its header is never seen.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  if (!seed) return null;

  const status = getOrderStatusMeta(order?.status);
  const { date, time } = formatOrderDateParts(order?.createdAt);
  const baseUrl = imageBaseUrl ?? order?.baseUrl ?? "";
  const orderStatus = String(order?.status ?? "").toUpperCase();

  const handlePrint = () => {
    if (!order) return;
    // Same hand-off the order page uses: the preview window reads the order
    // back out of sessionStorage.
    sessionStorage.setItem(
      ORDER_INVOICE_PREVIEW_STORAGE_KEY,
      JSON.stringify(order),
    );
    window.open(
      "/order-invoice-preview",
      "orderInvoicePreview",
      "width=900,height=900,scrollbars=yes,resizable=yes",
    );
  };

  const afterStatusChange = (message: string) => {
    toast.success(message);
    refetch();
    onChanged?.();
  };

  const handleStatusUpdate = (target: StatusTarget) => {
    if (!id) return;

    if (target === "PROCESSING") {
      toProcessing(id, {
        onSuccess: () =>
          afterStatusChange("تم تحديث حالة الطلب إلى قيد المعالجة"),
        onError: (err) =>
          toast.error(apiErrorMessage(err, "فشل تحديث حالة الطلب")),
      });
      return;
    }

    if (target === "SHIPPED") {
      if (dispatchFirst) {
        createShipment.mutate(
          {
            options: shipOptions,
            // A withdrawn parcel still holds the order's row; replace it.
            ...(shipment ? { force: true } : {}),
          },
          {
            onSuccess: () =>
              toShipped(id, {
                onSuccess: () =>
                  afterStatusChange(
                    `تم تسجيل الطرد لدى ${courier.displayName || "شركة الشحن"} وشحن الطلب`,
                  ),
                onError: (err) =>
                  toast.error(
                    apiErrorMessage(
                      err,
                      "سُجّل الطرد، لكن تعذر تحديث حالة الطلب إلى تم الشحن",
                    ),
                  ),
              }),
            onError: (err) =>
              toast.error(
                apiErrorMessage(err, "تعذر تسجيل الطرد لدى شركة الشحن"),
              ),
          },
        );
        return;
      }
      toShipped(id, {
        onSuccess: () => {
          afterStatusChange("تم تحديث حالة الطلب إلى تم الشحن");
          // Same press registers the Prime/courier parcel when none exists yet.
          dispatchIfNeeded();
        },
        onError: (err) =>
          toast.error(apiErrorMessage(err, "فشل تحديث حالة الطلب")),
      });
      return;
    }

    if (target === "DELIVERED") {
      toDelivered(id, {
        onSuccess: () =>
          afterStatusChange("تم تحديث حالة الطلب إلى تم التسليم"),
        onError: (err) =>
          toast.error(apiErrorMessage(err, "فشل تحديث حالة الطلب")),
      });
      return;
    }

    const cancelOrder = (force: boolean) =>
      toCancelled(
        { id, force },
        {
          onSuccess: () => {
            setConfirm(null);
            afterStatusChange("تم إلغاء الطلب وإرجاع الكميات إلى المخزون");
          },
          onError: (err) =>
            toast.error(apiErrorMessage(err, "فشل في إلغاء الطلب")),
        },
      );

    // A parcel the courier can take back is withdrawn first, so cancelling
    // never leaves a driver delivering an order the store has dropped. Only
    // a courier with no withdrawal API needs the forced cancel.
    if (liveParcel && canWithdraw) {
      cancelShipment.mutate(undefined, {
        onSuccess: () => cancelOrder(false),
        onError: (err) =>
          toast.error(
            apiErrorMessage(err, "تعذر سحب الطرد، فلم يُلغَ الطلب"),
          ),
      });
      return;
    }
    cancelOrder(!!liveParcel);
  };

  /**
   * «سحب من الشحن»: the courier takes the parcel back and the order returns
   * to «قيد المعالجة», where it can be shipped again or cancelled.
   */
  const handleWithdraw = () => {
    if (!id) return;
    cancelShipment.mutate(undefined, {
      onSuccess: () => {
        setConfirm(null);
        if (orderStatus !== "SHIPPED") {
          afterStatusChange("تم سحب الطرد من شركة الشحن");
          return;
        }
        toProcessing(id, {
          onSuccess: () =>
            afterStatusChange("تم سحب الطرد وأُعيد الطلب إلى قيد المعالجة"),
          onError: (err) =>
            toast.error(
              apiErrorMessage(
                err,
                "سُحب الطرد، لكن تعذر إرجاع الطلب إلى قيد المعالجة",
              ),
            ),
        });
      },
      onError: (err) => toast.error(apiErrorMessage(err, "تعذر سحب الطرد")),
    });
  };

  const canCancel =
    orderStatus !== "DELIVERED" && orderStatus !== "CANCELLED";
  /**
   * The courier has the parcel and has not delivered it. The server refuses
   * «تم التسليم» then (sync promotes the order itself once the courier
   * reports delivery), so the button waits instead of failing.
   */
  const awaitingCourier = orderStatus === "SHIPPED" && !!liveParcel;

  const nextStatusAction =
    orderStatus === "PENDING"
      ? {
          label: "بدء المعالجة",
          icon: Package,
          onClick: () => handleStatusUpdate("PROCESSING"),
        }
      : orderStatus === "PROCESSING"
        ? {
            label: "شحن الطلب",
            icon: Truck,
            onClick: () => handleStatusUpdate("SHIPPED"),
          }
        : orderStatus === "SHIPPED"
          ? {
              label: "تأكيد التسليم",
              icon: CheckCircle2,
              onClick: () => handleStatusUpdate("DELIVERED"),
            }
          : null;

  const invoiceCard = (
    <OrderDetailsInvoiceCard order={order} onSaved={() => refetch()} />
  );
  const financialCard = (
    <OrderFinancialCard order={order} calculateTotal={calculateTotal} />
  );
  // A withdrawn parcel on a reopened order is history, not its delivery.
  const shownParcel =
    shipment &&
    (liveParcel || (orderStatus !== "PENDING" && orderStatus !== "PROCESSING"))
      ? shipment
      : null;
  const deliveryCard = (
    <OrderDeliveryCard
      order={order}
      shipment={shownParcel}
      /**
       * The company holding **this parcel** first, and the store's current one
       * only when there is no parcel. A merchant who switches courier leaves
       * live parcels behind with the old one, so naming the current company
       * over someone else's parcel is simply wrong.
       */
      courierName={
        shownParcel
          ? (shownParcel.courier?.displayName ?? shownParcel.courierCode)
          : courier?.selected
            ? courier.deliveryCompanyName
            : null
      }
      courierLogo={
        shownParcel
          ? shownParcel.courier?.logo
          : courier?.selected && courier.integrated
            ? courier.logo
            : null
      }
    />
  );

  const StatusIcon = nextStatusAction?.icon;

  /**
   * By status: the step that moves the order on, «سحب من الشحن» while a
   * parcel is with a courier that can take it back, then cancel. Print
   * lives in the header so it is there for every status.
   */
  const actions = nextStatusAction || canCancel ? (
    <div className="flex flex-col items-stretch gap-3">
      {nextStatusAction ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={nextStatusAction.onClick}
            disabled={isUpdatingStatus || awaitingCourier}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 text-base font-bold text-white transition-colors hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-[#1a224c] dark:disabled:text-[#4a5596]"
          >
            {isUpdatingStatus ? (
              <Loader2 className="size-4 animate-spin" />
            ) : StatusIcon ? (
              <StatusIcon className="size-4" />
            ) : null}
            {nextStatusAction.label}
          </button>
          {awaitingCourier ? (
            <p className="text-center text-xs leading-relaxed text-slate-500 dark:text-[#a4b1fa]">
              يُؤكَّد التسليم تلقائياً حين تسلّم {parcelCourierName} الطرد. حدّث
              حالة الطرد من بطاقة الشحن.
            </p>
          ) : null}
        </div>
      ) : null}

      {canWithdraw && canCancel ? (
        <button
          type="button"
          onClick={() => setConfirm("withdraw")}
          disabled={isUpdatingStatus}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/60 bg-transparent text-base font-bold text-amber-700 transition-colors hover:bg-amber-500/10 disabled:opacity-50 dark:border-amber-400/40 dark:text-amber-300"
        >
          <Undo2 className="size-4" />
          سحب من الشحن
        </button>
      ) : null}

      {canCancel ? (
        <button
          type="button"
          onClick={() => setConfirm("cancel")}
          disabled={isUpdatingStatus}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-[#ff5252]/50 bg-transparent text-base font-bold text-[#ff5252] transition-colors hover:bg-[#ff5252]/10 disabled:opacity-50"
        >
          <Ban className="size-4" />
          إلغاء الطلب
        </button>
      ) : null}
    </div>
  ) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "left"}
        dir="rtl"
        showCloseButton={false}
        // Radix focuses the first button on open, which is now print in the
        // header, and it opened looking pressed. Nothing needs focus first.
        onOpenAutoFocus={(event) => event.preventDefault()}
        // On touch Radix judges an outside tap at `click`, by which time the
        // cancel confirm has already closed, so dismissing it (تراجع, the X or
        // its backdrop) also read as a tap outside the sheet and closed it.
        onInteractOutside={(event) => {
          const target = event.target as Element | null;
          if (
            target?.closest?.(
              '[data-slot="dialog-content"], [data-slot="dialog-overlay"]',
            )
          ) {
            event.preventDefault();
          }
        }}
        className={cn(
          "z-[60] flex flex-col gap-0 border-0 p-0 text-foreground outline-none",
          "bg-slate-50 dark:bg-[#12183b]",
          isMobile
            ? cn(
                "inset-x-0 bottom-0 top-auto h-auto max-h-[92dvh] w-full max-w-none rounded-t-[32px]",
                "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
              )
            : cn(
                // Figma leaves a sliver of the list showing on the right.
                "top-3 bottom-3 left-3 h-auto w-[calc(100vw-5rem)] max-w-[1480px] rounded-[32px]",
                "data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
              ),
        )}
      >
        {isMobile ? (
          <div className="flex shrink-0 justify-center pt-3">
            <span className="h-1.5 w-12 rounded-full bg-border" />
          </div>
        ) : null}

        {/* RTL: the first child sits rightmost, so the order code leads on the
            right and the status pill lands on the left, as drawn. */}
        <SheetHeader className="shrink-0 flex-row items-start justify-between gap-3 space-y-0 px-5 py-5 text-right sm:px-7">
          <div className="min-w-0">
            <SheetTitle className="text-2xl font-bold text-sky-600 dark:text-[#33c5ff]">
              <Ltr>{formatOrderCode(order?.id)}</Ltr>
            </SheetTitle>
            <SheetDescription className="mt-0.5 text-sm text-slate-500 dark:text-[#a4b1fa]">
              تاريخ الطلب <Ltr>{date}</Ltr>
              {time ? (
                <>
                  {" "}
                  في <Ltr>{time}</Ltr>
                </>
              ) : null}
            </SheetDescription>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium",
                status.className,
              )}
            >
              <StatusGlyph tone={status.tone} />
              {status.label}
            </span>
            <button
              type="button"
              onClick={handlePrint}
              aria-label="طباعة الفاتورة"
              className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 sm:px-3.5 dark:border-[#2a3160] dark:bg-[#0a0e27] dark:text-[#e4e7fc] dark:hover:bg-[#12183b]"
            >
              <Printer className="size-4" />
              <span className="hidden sm:inline">طباعة الفاتورة</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="إغلاق"
              className="flex size-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:text-[#4a5596] dark:hover:bg-white/5 dark:hover:text-[#e4e7fc]"
            >
              <X className="size-4" />
            </button>
          </div>
        </SheetHeader>

        {isMobile && !locked ? (
          <div className="shrink-0 px-5 pb-4">
            <SwitchTab
              selected={tab}
              onChange={setTab}
              accent="violet"
              options={MOBILE_TABS}
            />
          </div>
        ) : null}

        <div
          ref={scrollRef}
          className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-7"
        >
          {locked ? (
            <OrderDetailsLocked compact />
          ) : isMobile ? (
            tab === "items" ? (
              <OrderDetailsItems
                order={order}
                imageBaseUrl={baseUrl}
                variant="cards"
              />
            ) : (
              <div className="space-y-4">
                {invoiceCard}
                {financialCard}
                {deliveryCard}
                <OrderShipmentCard
                  order={order}
                  onUpdated={() => refetch()}
                  shipOptions={shipOptions}
                  onShipOptionsChange={setShipOptions}
                />
                <section className="rounded-[24px] bg-white p-4 dark:bg-[#0a0e27]">
                  <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-[#e4e7fc]">
                    سجل الطلب
                  </h3>
                  <OrderDetailsTimeline logs={logs} isLoading={isLoadingLogs} />
                </section>
                {actions}
              </div>
            )
          ) : (
            <div className="space-y-4">
              {invoiceCard}

              {/* RTL: first track is rightmost — سجل | منتجات | مالية+توصيل+أزرار */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(240px,280px)_minmax(0,1fr)_minmax(280px,320px)]">
                <section className="min-w-0 rounded-[24px] bg-white p-4 dark:bg-[#0a0e27]">
                  <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-[#e4e7fc]">
                    سجل الطلب
                  </h3>
                  <OrderDetailsTimeline logs={logs} isLoading={isLoadingLogs} />
                </section>
                <div className="min-w-0 space-y-4">
                  <OrderDetailsItems
                    order={order}
                    imageBaseUrl={baseUrl}
                    variant="table"
                  />
                  <OrderShipmentCard
                  order={order}
                  onUpdated={() => refetch()}
                  shipOptions={shipOptions}
                  onShipOptionsChange={setShipOptions}
                />
                </div>
                <div className="min-w-0 space-y-4">
                  {financialCard}
                  {deliveryCard}
                  {actions}
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>

      {/*
        إلغاء الطلب / سحب من الشحن — both confirmed, and both name the parcel
        when there is one. Cancelling returns the stock; a parcel the courier
        can take back is withdrawn first, and only a courier with no
        withdrawal API needs the forced cancel and a phone call.
      */}
      <Dialog
        open={confirm !== null}
        onOpenChange={(next) => !next && setConfirm(null)}
      >
        {/* The sheet sits at z-[60]; at the default z-50 this confirm opened
          behind it and the cancel button looked dead. */}
        <DialogContent
          className="z-[70] text-right"
          overlayClassName="z-[70]"
          dir="rtl"
        >
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">
              {confirm === "withdraw" ? "سحب الطرد من الشحن" : "تأكيد إلغاء الطلب"}
            </DialogTitle>
            <DialogDescription className="text-right">
              {confirm === "withdraw"
                ? "ستُطلب من شركة الشحن استعادة الطرد، ويعود الطلب إلى «قيد المعالجة» لتعيد شحنه أو تلغيه. ترفض الشركة السحب إن كان الطرد قد سُلّم للسائق."
                : "الإلغاء نهائي ولا يمكن التراجع عنه، وتُرجَع الكميات إلى المخزون."}
            </DialogDescription>
          </DialogHeader>

          {liveParcel ? (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-right text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <Truck className="mt-0.5 size-4 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold">
                  الطرد <Ltr>{liveParcel.externalId}</Ltr> لدى {parcelCourierName}
                </p>
                {confirm === "cancel" ? (
                  <p className="text-xs">
                    {canWithdraw
                      ? "سيُسحب الطرد من الشركة أولاً، ثم يُلغى الطلب."
                      : "لا تدعم الشركة السحب عبر النظام: الإلغاء هنا لا يُبلغها، فاتصل بها لإيقاف التسليم."}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              onClick={() => setConfirm(null)}
              disabled={isUpdatingStatus}
            >
              تراجع
            </Button>
            <Button
              variant="destructive"
              className={cn(
                confirm === "withdraw" &&
                  "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600",
              )}
              disabled={isUpdatingStatus}
              onClick={() =>
                confirm === "withdraw"
                  ? handleWithdraw()
                  : handleStatusUpdate("CANCELLED")
              }
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {confirm === "withdraw" ? "جاري السحب..." : "جاري الإلغاء..."}
                </>
              ) : confirm === "withdraw" ? (
                "سحب الطرد"
              ) : liveParcel && !canWithdraw ? (
                "إلغاء الطلب رغم وجود الطرد"
              ) : (
                "تأكيد الإلغاء"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
};

export default OrderDetailsSheet;
