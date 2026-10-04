import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { formatCurrency } from "@/utils/format-currency";
import Ltr from "@/components/Ltr";

/**
 * شحن الطلب — بأي شركة يستخدمها المتجر.
 *
 * Replaces the Prime-only card. Nothing here names a courier: the parcel is
 * registered, polled, tracked, labelled and withdrawn through one set of
 * routes, and the server picks the adapter off the company the store chose.
 *
 * Two things shape the whole component:
 *
 * - **Every button is gated on `capabilities`.** Three of the four couriers
 *   cannot quote, two cannot produce a label and Al-Waseet cannot cancel
 *   through the API at all. Those are vendor limitations somebody verified,
 *   not gaps — so a button that would return 422 is not rendered, because a
 *   merchant reads a failing button as a broken dashboard rather than as
 *   something their courier cannot do.
 * - **Dispatch is an act, never automatic.** It costs the merchant money and
 *   cannot be undone once a driver holds the parcel, which is why no order
 *   status triggers it and why this is a button someone presses.
 */

const STATUS_LABEL: Record<CourierShipmentStatus, string> = {
  CREATED: "مُسجَّل",
  PICKED_UP: "استلمه المندوب",
  IN_TRANSIT: "في الطريق",
  OUT_FOR_DELIVERY: "خارج للتوصيل",
  DELIVERED: "تم التسليم",
  RETURNED: "راجع",
  CANCELLED: "ملغى",
  FAILED: "محاولة فاشلة",
  UNKNOWN: "غير معروف",
};

const STATUS_TONE: Record<CourierShipmentStatus, string> = {
  CREATED: "bg-slate-100 text-slate-700",
  PICKED_UP: "bg-blue-100 text-blue-700",
  IN_TRANSIT: "bg-blue-100 text-blue-700",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  RETURNED: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-slate-200 text-slate-600",
  FAILED: "bg-red-100 text-red-700",
  UNKNOWN: "bg-slate-100 text-slate-500",
};

/** The courier's own message, which is always more useful than a guess. */
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

  const message =
    data?.message ?? data?.errorMessage ?? data?.error?.message;
  if (typeof message === "string" && message.trim()) return message;
  if (Array.isArray(message) && message.length) return message.join("، ");
  return fallback;
};

type Props = {
  order: Record<string, unknown>;
  onUpdated?: () => void;
};

const OrderShipmentCard = ({ order, onUpdated }: Props) => {
  const orderId = String(order.id ?? "");

  const { data: courier, isLoading: courierLoading } = useActiveCourier();
  const { data: shipment, isLoading: shipmentLoading } =
    useOrderShipment(orderId);

  const [showTracking, setShowTracking] = useState(false);
  const { data: tracking, isFetching: trackingLoading } = useOrderTracking(
    orderId,
    showTracking,
  );

  const [options, setOptions] = useState<CreateShipmentOptions>({});

  const createShipment = useCreateShipment(orderId);
  const syncShipment = useSyncShipment(orderId);
  const cancelShipment = useCancelShipment(orderId);
  const shipmentLabel = useShipmentLabel(orderId);

  const integrated = courier?.selected === true && courier.integrated === true;
  const capabilities = integrated ? courier.capabilities : null;

  /**
   * What the shopper paid for delivery, against what the courier bills.
   *
   * Only Prime prices a parcel before it exists, so for the other three the
   * shopper's fee came from the merchant's own fallback rules and the gap is
   * the merchant's to absorb. It is shown rather than hidden for exactly
   * that reason.
   */
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
      <Card>
        <CardContent className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          جارٍ قراءة بيانات الشحن…
        </CardContent>
      </Card>
    );
  }

  /** No courier chosen, or one with nothing behind it. Both are states. */
  if (!courier || courier.selected === false || courier.integrated === false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4" />
            الشحن
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {courier && courier.selected === false
              ? "لم تختر شركة شحن بعد. اخترها من الإعدادات لتتمكن من شحن الطلبات."
              : (courier?.reason ??
                "لا يمكن الشحن من هنا لهذا المتجر حاليًا.")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Truck className="h-4 w-4" />
          الشحن عبر {courier.deliveryCompanyName || courier.displayName}
        </CardTitle>
        {shipment && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_TONE[shipment.status]}`}
          >
            {STATUS_LABEL[shipment.status] ?? shipment.status}
          </span>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/*
          The courier needs something only an operator can provide — Prime's
          shop id, Boxy's pick-up location. Said here rather than letting the
          merchant discover it as a 422 on a real order.
        */}
        {!courier.accountReady && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-bold">
                لم يكتمل تسجيل المتجر لدى {courier.displayName}
              </p>
              <p className="mt-1 text-xs">
                راجع فريق الدعم لاستكمال التسجيل. لا يمكن شحن الطلبات حتى
                يكتمل.
              </p>
            </div>
          </div>
        )}

        {shipment ? (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">رقم الطرد</p>
                <p className="font-bold">
                  <Ltr>{shipment.externalId ?? "—"}</Ltr>
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">رقمنا المرجعي</p>
                <p className="font-bold">
                  <Ltr>{shipment.reference ?? "—"}</Ltr>
                </p>
              </div>
              {/* The courier's own words, which survive whatever the
                  platform's status says — and are the thing to read when a
                  parcel sits on a vague status. */}
              {shipment.rawStatus && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">حالة الشركة</p>
                  <p className="font-bold">{shipment.rawStatus}</p>
                </div>
              )}
            </div>

            {feeGap && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">دفع الزبون</span>
                  <span className="font-bold">
                    {formatCurrency(feeGap.paid)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-muted-foreground">
                    تحاسبك الشركة
                  </span>
                  <span className="font-bold">
                    {formatCurrency(feeGap.billed)}
                  </span>
                </div>
                {feeGap.difference !== 0 && (
                  <p
                    className={`mt-2 text-xs font-bold ${
                      feeGap.difference > 0
                        ? "text-red-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {feeGap.difference > 0
                      ? `الفرق عليك: ${formatCurrency(feeGap.difference)}`
                      : `الفرق لصالحك: ${formatCurrency(-feeGap.difference)}`}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {capabilities?.getShipment && (
                <Button
                  variant="outline"
                  size="sm"
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
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  تحديث الحالة
                </Button>
              )}

              {capabilities?.track && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTracking((value) => !value)}
                >
                  <Route className="h-4 w-4" />
                  {showTracking ? "إخفاء المسار" : "عرض المسار"}
                </Button>
              )}

              {capabilities?.label && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={shipmentLabel.isPending}
                  onClick={async () => {
                    try {
                      const result = await shipmentLabel.mutateAsync(undefined);
                      // Opened rather than downloaded: the couriers return a
                      // URL, and which of a receipt, a label or a tracking
                      // page it is depends on the vendor.
                      if (result?.labelUrl) {
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
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Printer className="h-4 w-4" />
                  )}
                  الملصق
                </Button>
              )}

              {shipment.labelUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={shipment.labelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    صفحة التتبّع
                  </a>
                </Button>
              )}

              {/* Al-Waseet publishes no cancellation endpoint, so no button
                  is drawn for it — a merchant is told to phone them rather
                  than shown a control that always fails. */}
              {capabilities?.cancelShipment &&
                shipment.status !== "CANCELLED" &&
                shipment.status !== "DELIVERED" &&
                shipment.status !== "RETURNED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
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
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Ban className="h-4 w-4" />
                    )}
                    سحب الطرد
                  </Button>
                )}
            </div>

            {!capabilities?.cancelShipment && (
              <p className="text-xs text-muted-foreground">
                لا تدعم {courier.displayName} سحب الطرد عبر النظام — اتصل بهم
                مباشرة.
              </p>
            )}

            {showTracking && (
              <div className="rounded-lg border p-3">
                {trackingLoading ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جارٍ قراءة المسار…
                  </p>
                ) : tracking && tracking.length > 0 ? (
                  <ol className="space-y-3">
                    {tracking.map((event, index) => (
                      <li
                        key={`${event.rawStatusCode ?? event.status}-${index}`}
                        className="flex items-start gap-3 text-sm"
                      >
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <div>
                          <p className="font-bold">
                            {event.rawStatus ??
                              STATUS_LABEL[event.status] ??
                              event.status}
                          </p>
                          {event.occurredAt && (
                            <p className="text-xs text-muted-foreground">
                              <Ltr>{event.occurredAt}</Ltr>
                            </p>
                          )}
                          {event.note && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {event.note}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    لا يوجد مسار مسجَّل لهذا الطرد.
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              لم يُسجَّل هذا الطلب لدى شركة الشحن بعد.
            </p>

            {/* Only the extras. Everything else about the parcel — the
                recipient, the address, the money, the contents — is read off
                the order on the server. */}
            {courier.code === "boxy" && (
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
                    <SelectTrigger className="mt-1">
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
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={options.isFragile ?? false}
                      onChange={(event) =>
                        setOptions((current) => ({
                          ...current,
                          isFragile: event.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                    قابل للكسر
                  </label>
                </div>
              </div>
            )}

            {(courier.code === "modon" || courier.code === "alwaseet") && (
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
                  className="h-4 w-4"
                />
                طرد استبدال
              </label>
            )}

            <Button
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
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Truck className="h-4 w-4" />
              )}
              شحن الطلب
            </Button>

            {/* Only Prime prices a parcel before it exists. Saying so here
                stops a merchant waiting for a quote that is never coming. */}
            {!capabilities?.quote && (
              <p className="text-xs text-muted-foreground">
                لا تعطي {courier.displayName} سعرًا قبل التسجيل — تظهر الأجرة
                الفعلية بعد شحن الطلب.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderShipmentCard;
