/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Loader2, Printer, Trash2, X } from "lucide-react";
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
import SwitchTab from "@/components/table/switch-tab";
import StatusGlyph from "@/components/table/status-glyph";
import Ltr from "@/components/Ltr";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import { useDeleteOrder, useFetchOrder, useFetchOrderLogs } from "@/api/wrappers/order.wrappers";
import { useActiveCourier, useOrderShipment } from "@/api/wrappers/shipping.wrappers";
import { ORDER_INVOICE_PREVIEW_STORAGE_KEY } from "@/pages/order/OrderInvoicePreview";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // The row already carries enough to paint the header and the summary, so the
  // drawer opens filled; the detail call fills in lines, logs and the parcel.
  const { data: fresh, refetch } = useFetchOrder(id, open);
  const order = fresh ? { ...seed, ...fresh } : seed;

  const { data: logs, isLoading: isLoadingLogs } = useFetchOrderLogs(id, open);
  const { data: shipment } = useOrderShipment(id, open);
  const { data: courier } = useActiveCourier(open);
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();

  useEffect(() => {
    if (!open) {
      setTab("info");
      setConfirmingDelete(false);
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
      onError: (err: any) =>
        toast.error(err?.response?.data?.message || "فشل في حذف الطلب"),
    });
  };

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

  // RTL: `flex-row` puts the first child rightmost, so طباعة الفاتورة lands
  // on the right and حذف الطلب on the left, as drawn.
  const actions = (
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
        disabled={isDeleting}
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
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "left"}
        dir="rtl"
        showCloseButton={false}
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

        {isMobile ? (
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
          {isMobile ? (
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

              {/* RTL grid: first track is the rightmost column, which is where
                  Figma puts the log. */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
                <div className="min-w-0">
                  <OrderDetailsTimeline logs={logs} isLoading={isLoadingLogs} />
                </div>
                <div className="min-w-0">
                  <OrderDetailsItems
                    order={order}
                    imageBaseUrl={baseUrl}
                    variant="table"
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
    </Sheet>
  );
};

export default OrderDetailsSheet;
