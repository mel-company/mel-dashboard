/* eslint-disable @typescript-eslint/no-explicit-any */
import OrderDetailsLocked from "@/components/plan/OrderDetailsLocked";
import {
  isSubscriptionExpiredError,
  usePlanUsage,
} from "@/hooks/use-plan-limits";
import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Package,
  Printer,
  Trash2,
  Truck,
  X,
  XCircle,
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
import { isParcelLive } from "@/api/types/shipping";
import {
  useDeleteOrder,
  useFetchOrder,
  useFetchOrderLogs,
  useUpdateStatusToCancelled,
  useUpdateStatusToDelivered,
  useUpdateStatusToProcessing,
  useUpdateStatusToShipped,
} from "@/api/wrappers/order.wrappers";
import { useActiveCourier, useOrderShipment } from "@/api/wrappers/shipping.wrappers";
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
  /** Refresh the list behind the drawer after a delete. */
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
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
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
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();
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
    isDispatching;
  const liveParcel = shipment && isParcelLive(shipment) ? shipment : null;

  useEffect(() => {
    if (!open) {
      setTab("info");
      setConfirmingDelete(false);
      setCancelOpen(false);
    }
  }, [open]);

  // «تأكيد الحذف» stayed armed for as long as the drawer was open, so a stray
  // tap minutes later deleted the order with no second look. Disarm it.
  useEffect(() => {
    if (!confirmingDelete) return;
    const timer = window.setTimeout(() => setConfirmingDelete(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirmingDelete]);

  // Switching tabs keeps the scroll offset otherwise, so the products tab
  // opens half way down and its header is never seen.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  if (!seed) return null;

  const status = getOrderStatusMeta(order?.status);
  const { date, time } = formatOrderDateParts(order?.createdAt);
  const baseUrl = imageBaseUrl ?? order?.baseUrl ?? "";

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

  const handleDelete = () => {
    if (!id) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    deleteOrder(id, {
      onSuccess: () => {
        toast.success("تم حذف الطلب");
        onOpenChange(false);
        onChanged?.();
      },
      onError: (err: unknown) =>
        toast.error(apiErrorMessage(err, "فشل في حذف الطلب")),
    });
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

    toCancelled(
      { id, force: !!liveParcel },
      {
        onSuccess: () => {
          setCancelOpen(false);
          afterStatusChange("تم إلغاء الطلب بنجاح");
        },
        onError: (err) =>
          toast.error(apiErrorMessage(err, "فشل في إلغاء الطلب")),
      },
    );
  };

  const orderStatus = String(order?.status ?? "").toUpperCase();
  const canCancel =
    orderStatus !== "DELIVERED" && orderStatus !== "CANCELLED";

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
  const deliveryCard = (
    <OrderDeliveryCard
      order={order}
      shipment={shipment}
      /**
       * The company holding **this parcel** first, and the store's current one
       * only when there is no parcel. A merchant who switches courier leaves
       * live parcels behind with the old one, so naming the current company
       * over someone else's parcel is simply wrong.
       */
      courierName={
        shipment
          ? (shipment.courier?.displayName ?? shipment.courierCode)
          : courier?.selected
            ? courier.deliveryCompanyName
            : null
      }
    />
  );

  const StatusIcon = nextStatusAction?.icon;

  // Status first (complete the order), then print / delete — the sheet used
  // to only expose print+delete, so merchants could not advance PENDING → …
  // → DELIVERED from the list drawer at all.
  const actions = (
    <div className="flex flex-col items-stretch gap-3">
      {nextStatusAction ? (
        <button
          type="button"
          onClick={nextStatusAction.onClick}
          disabled={isUpdatingStatus}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 text-base font-bold text-white transition-opacity hover:bg-sky-700 disabled:opacity-50"
        >
          {isUpdatingStatus ? (
            <Loader2 className="size-4 animate-spin" />
          ) : StatusIcon ? (
            <StatusIcon className="size-4" />
          ) : null}
          {nextStatusAction.label}
        </button>
      ) : null}

      {/* RTL: `flex-row` puts the first child rightmost, so طباعة الفاتورة
          lands on the right and حذف الطلب on the left, as drawn. */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handlePrint}
          className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl bg-linear-to-l from-[#b282ff] to-[#33c5ff] text-base font-bold text-white transition-opacity hover:opacity-90"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-white/20">
            <Printer className="size-4" />
          </span>
          طباعة الفاتورة
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting || isUpdatingStatus}
          className={cn(
            "flex h-[52px] items-center justify-center gap-2 rounded-2xl border px-5 text-base font-bold transition-colors disabled:opacity-50 sm:w-auto sm:flex-1",
            confirmingDelete
              ? "border-transparent bg-[#ff5252] text-white hover:bg-[#ff3b3b]"
              : "border-[#ff5252]/30 text-[#ff5252] hover:bg-[#ff5252]/10",
          )}
        >
          {isDeleting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          {confirmingDelete ? "تأكيد الحذف" : "حذف الطلب"}
        </button>
      </div>

      {canCancel ? (
        <button
          type="button"
          onClick={() => setCancelOpen(true)}
          disabled={isUpdatingStatus}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 text-base font-bold text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50"
        >
          <XCircle className="size-4" />
          إلغاء الطلب
        </button>
      ) : null}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "left"}
        dir="rtl"
        showCloseButton={false}
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
          "z-[60] flex flex-col gap-0 border-0 p-0 text-foreground",
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
                <OrderShipmentCard order={order} onUpdated={() => refetch()} />
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
                  <OrderShipmentCard order={order} onUpdated={() => refetch()} />
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
        إلغاء الطلب — confirmed, and loudest where a parcel is in the air.
        Same acknowledgement the full order page uses: cancel returns stock
        but does not notify the courier unless force is sent after the merchant
        has seen the live parcel named here.
      */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        {/* The sheet sits at z-[60]; at the default z-50 this confirm opened
          behind it and the cancel button looked dead. */}
        <DialogContent
          className="z-[70] text-right"
          overlayClassName="z-[70]"
          dir="rtl"
        >
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">تأكيد إلغاء الطلب</DialogTitle>
            <DialogDescription className="text-right">
              الإلغاء نهائي ولا يمكن التراجع عنه، وتُرجَع الكميات إلى المخزون.
            </DialogDescription>
          </DialogHeader>

          {liveParcel ? (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-right text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <Truck className="mt-0.5 size-4 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold">
                  هذا الطلب ما زال لديه طرد نشط لدى{" "}
                  {liveParcel.courier?.displayName ?? liveParcel.courierCode}
                </p>
                <p className="text-xs">
                  رقم الطرد <Ltr>{liveParcel.externalId}</Ltr>. الإلغاء هنا لا
                  يُبلِغ الشركة —{" "}
                  {liveParcel.courier?.capabilities?.cancelShipment
                    ? "اسحب الطرد من بطاقة الشحن أولاً، أو ألغِ الطلب ثم تابع الطرد مع الشركة."
                    : "لا تدعم الشركة السحب عبر النظام، فاتصل بها لإيقاف التسليم."}
                </p>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              onClick={() => setCancelOpen(false)}
              disabled={isToCancelled}
            >
              تراجع
            </Button>
            <Button
              variant="destructive"
              disabled={isToCancelled}
              onClick={() => handleStatusUpdate("CANCELLED")}
            >
              {isToCancelled ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جاري الإلغاء...
                </>
              ) : liveParcel ? (
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
