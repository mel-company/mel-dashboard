import { useEffect, useMemo, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, RefreshCw, Truck } from "lucide-react";
import { toast } from "sonner";
import { isPrimeDelivery } from "@/api/types/store";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import { usePrimeSetupStatus } from "@/hooks/use-prime-setup-status";
import {
  useCalculatePrimeCharges,
  useCreatePrimeShipment,
  usePrimeDistricts,
  usePrimeStates,
  useSyncPrimeOrderShipment,
} from "@/api/wrappers/prime.wrappers";
import {
  asPrimeList,
  getPrimeDistrictId,
  getPrimeDistrictLabel,
  getPrimeStateCode,
  getPrimeStateLabel,
} from "@/utils/prime/lookups";
import {
  buildPrimeShipmentFromOrder,
  formatPrimeShipmentStatus,
  getOrderPrimeShipment,
} from "@/utils/order/prime-shipment";

type Props = {
  order: Record<string, unknown>;
  onUpdated?: () => void;
};

const OrderPrimeShipmentCard = ({ order, onUpdated }: Props) => {
  const { data: storeDetails } = useFetchStoreDetails();
  const setupStatus = usePrimeSetupStatus();
  const primeShipment = getOrderPrimeShipment(order);
  const orderId = String(order.id ?? "");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [stateCode, setStateCode] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [shippingFee, setShippingFee] = useState<number | null>(null);

  const { data: statesData, isLoading: loadingStates } = usePrimeStates(
    dialogOpen,
  );
  const { data: districtsData, isLoading: loadingDistricts } = usePrimeDistricts(
    stateCode,
    dialogOpen && !!stateCode,
  );

  const createMutation = useCreatePrimeShipment();
  const syncMutation = useSyncPrimeOrderShipment();
  const calculateMutation = useCalculatePrimeCharges();

  const states = useMemo(() => asPrimeList(statesData), [statesData]);
  const districts = useMemo(() => asPrimeList(districtsData), [districtsData]);

  useEffect(() => {
    if (!dialogOpen || states.length === 0) return;
    const codes = states.map(getPrimeStateCode).filter(Boolean);
    if (codes.length > 0 && (!stateCode || !codes.includes(stateCode))) {
      setStateCode(codes[0]);
    }
  }, [dialogOpen, states, stateCode]);

  useEffect(() => {
    if (!dialogOpen || !stateCode) return;
    setDistrictId("");
    setShippingFee(null);
  }, [dialogOpen, stateCode]);

  useEffect(() => {
    if (!dialogOpen || districts.length === 0) return;
    const firstId = getPrimeDistrictId(districts[0]);
    if (firstId != null) setDistrictId(String(firstId));
  }, [dialogOpen, districts]);

  if (!isPrimeDelivery(storeDetails)) return null;

  const senderId = setupStatus.senderId;
  const districtNumber = Number(districtId);
  const canCreate =
    !!senderId &&
    !!stateCode &&
    Number.isInteger(districtNumber) &&
    districtNumber >= 1 &&
    !loadingStates &&
    !loadingDistricts;

  const handleCalculate = () => {
    if (!senderId || !canCreate) return;
    calculateMutation.mutate(
      {
        state: stateCode,
        district: districtNumber,
        receiptAmtIqd: Number(
          (order.pricing as Record<string, unknown> | undefined)?.totalPrice ?? 0,
        ),
        senderId,
      },
      {
        onSuccess: (data) => {
          const fee =
            (data as Record<string, unknown>)?.shippingFee ??
            (data as Record<string, unknown>)?.shipping_fee;
          if (typeof fee === "number") setShippingFee(fee);
          toast.success("تم حساب رسوم الشحن");
        },
        onError: () => toast.error("فشل حساب رسوم الشحن"),
      },
    );
  };

  const handleCreate = () => {
    if (!senderId || !canCreate) return;

    const payload = buildPrimeShipmentFromOrder(
      order,
      senderId,
      stateCode,
      districtNumber,
    );

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("تم إنشاء شحنة Prime وربطها بالطلب");
        setDialogOpen(false);
        onUpdated?.();
      },
      onError: (error) => {
        const apiError = error as Error & {
          response?: { data?: { message?: string | string[] } };
        };
        const message = apiError.response?.data?.message;
        toast.error(
          Array.isArray(message)
            ? message.join(" — ")
            : message || "فشل إنشاء الشحنة",
        );
      },
    });
  };

  const handleSync = () => {
    syncMutation.mutate(orderId, {
      onSuccess: () => {
        toast.success("تمت مزامنة حالة الشحنة");
        onUpdated?.();
      },
      onError: () => toast.error("فشلت المزامنة"),
    });
  };

  const busy =
    createMutation.isPending ||
    syncMutation.isPending ||
    calculateMutation.isPending;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <Truck className="size-5" />
            شحنة Prime
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {primeShipment ? (
            <div className="space-y-2 rounded-xl border bg-slate-50 p-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">رقم الشحنة</span>
                <span className="font-medium" dir="ltr">
                  {primeShipment.caseId ?? "—"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">كود الشحنة</span>
                <span dir="ltr">{primeShipment.merchantShipmentCode ?? "—"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">الحالة</span>
                <span>{formatPrimeShipmentStatus(primeShipment.status)}</span>
              </div>
              {primeShipment.shippingFee != null && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">رسوم الشحن</span>
                  <span>{primeShipment.shippingFee.toLocaleString()} د.ع</span>
                </div>
              )}
              {primeShipment.receiptNumber && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">رقم الوصل</span>
                  <span dir="ltr">{primeShipment.receiptNumber}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              لا توجد شحنة Prime مربوطة بهذا الطلب بعد.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {!primeShipment && (
              <Button
                size="sm"
                disabled={!setupStatus.isReady || busy}
                onClick={() => setDialogOpen(true)}
              >
                إنشاء شحنة Prime
              </Button>
            )}
            {primeShipment && (
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={handleSync}
              >
                {syncMutation.isPending ? (
                  <Loader2 className="ml-1 size-3 animate-spin" />
                ) : (
                  <RefreshCw className="ml-1 size-3" />
                )}
                مزامنة الحالة
              </Button>
            )}
          </div>

          {!setupStatus.isReady && !primeShipment && (
            <p className="text-xs text-amber-700">
              أكمل إعداد Prime من الإعدادات أولاً (حساب + محل).
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="text-right sm:max-w-md">
          <DialogHeader className="text-right">
            <DialogTitle>إنشاء شحنة Prime للطلب</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">محافظة Prime</Label>
              <Select value={stateCode || undefined} onValueChange={setStateCode}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingStates ? "..." : "اختر"} />
                </SelectTrigger>
                <SelectContent>
                  {states.map((s) => {
                    const code = getPrimeStateCode(s);
                    if (!code) return null;
                    return (
                      <SelectItem key={code} value={code}>
                        {getPrimeStateLabel(s)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">قضاء Prime</Label>
              <Select
                value={districtId || undefined}
                onValueChange={setDistrictId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={loadingDistricts ? "..." : "اختر"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => {
                    const id = getPrimeDistrictId(d);
                    if (id == null) return null;
                    return (
                      <SelectItem key={String(id)} value={String(id)}>
                        {getPrimeDistrictLabel(d)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            {shippingFee != null && (
              <p className="text-sm text-sky-700">
                رسوم الشحن المتوقعة: {shippingFee.toLocaleString()} د.ع
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              disabled={!canCreate || calculateMutation.isPending}
              onClick={handleCalculate}
            >
              حساب الرسوم
            </Button>
            <Button disabled={!canCreate || busy} onClick={handleCreate}>
              {createMutation.isPending && (
                <Loader2 className="ml-1 size-3 animate-spin" />
              )}
              إنشاء الشحنة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderPrimeShipmentCard;
