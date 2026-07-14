import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Loader2, RefreshCw, Truck } from "lucide-react";
import { toast } from "sonner";
import { primeAPI } from "@/api/endpoints/prime.endpoints";
import { storeAPI } from "@/api/endpoints/store.endpoints";
import { getPrimeSenderId, isPrimeDelivery } from "@/api/types/store";
import { storeKeys, useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import { usePrimeSetupStatus } from "@/hooks/use-prime-setup-status";
import {
  useCreatePrimeShipment,
  usePrimeDistricts,
  usePrimeLogin,
  usePrimeStates,
  useSyncPrimeOrderShipment,
} from "@/api/wrappers/prime.wrappers";
import {
  asPrimeList,
  getPrimeDistrictId,
  getPrimeDistrictLabel,
  getPrimeStateCode,
  getPrimeStateLabel,
  pickDefaultPrimeState,
} from "@/utils/prime/lookups";
import { getPrimeApiError } from "@/utils/prime/errors";
import { extractSenderIdFromShops } from "@/utils/prime/setup";
import {
  buildPrimeShipmentFromOrder,
  formatPrimeShipmentStatus,
  getOrderDeliveryAddress,
  getOrderPrimeShipment,
  getPrimeDistrictLabelById,
  guessPrimeStateFromOrder,
  resolvePrimeLocationForOrder,
} from "@/utils/order/prime-shipment";

type Props = {
  order: Record<string, unknown>;
  onUpdated?: () => void;
};

const OrderPrimeShipmentCard = ({ order, onUpdated }: Props) => {
  const queryClient = useQueryClient();
  const { data: storeDetails } = useFetchStoreDetails();
  const setupStatus = usePrimeSetupStatus();
  const loginMutation = usePrimeLogin();
  const primeShipment = getOrderPrimeShipment(order);
  const orderId = String(order.id ?? "");

  const canAutoShip = setupStatus.isReady && !primeShipment;
  const [showManual, setShowManual] = useState(false);
  const [manualState, setManualState] = useState("");
  const [manualDistrict, setManualDistrict] = useState("");
  const [resolvedSenderId, setResolvedSenderId] = useState<number | undefined>(
    setupStatus.senderId,
  );

  const { data: statesData, isLoading: loadingStates } =
    usePrimeStates(canAutoShip);
  const states = useMemo(() => asPrimeList(statesData), [statesData]);
  const merchantDefaults = storeDetails?.primeMerchant;
  const deliveryAddress = useMemo(() => getOrderDeliveryAddress(order), [order]);

  const autoState = useMemo(() => {
    if (!canAutoShip || states.length === 0) return "";
    return pickDefaultPrimeState(
      states,
      guessPrimeStateFromOrder(order) || merchantDefaults?.state,
    );
  }, [canAutoShip, states, order, merchantDefaults?.state]);

  const lookupState = showManual ? manualState || autoState : autoState;

  const { data: districtsData, isLoading: loadingDistricts } = usePrimeDistricts(
    lookupState,
    canAutoShip && !!lookupState,
  );
  const districts = useMemo(() => asPrimeList(districtsData), [districtsData]);

  const autoLocation = useMemo(
    () =>
      canAutoShip && states.length > 0 && districts.length > 0
        ? resolvePrimeLocationForOrder(
            order,
            states,
            districts,
            merchantDefaults?.state,
          )
        : null,
    [canAutoShip, order, states, districts, merchantDefaults?.state],
  );

  const createMutation = useCreatePrimeShipment();
  const syncMutation = useSyncPrimeOrderShipment();

  useEffect(() => {
    setResolvedSenderId(getPrimeSenderId(storeDetails));
  }, [storeDetails]);

  useEffect(() => {
    if (!showManual || !autoLocation) return;
    if (!manualState) setManualState(autoLocation.state);
    if (!manualDistrict) setManualDistrict(String(autoLocation.district));
  }, [showManual, autoLocation, manualState, manualDistrict]);

  if (!isPrimeDelivery(storeDetails)) return null;

  const senderId = resolvedSenderId;
  const activeState = showManual ? manualState : autoLocation?.state ?? "";
  const activeDistrict = showManual
    ? Number(manualDistrict)
    : autoLocation?.district ?? 0;
  const districtLabel =
    activeDistrict > 0
      ? getPrimeDistrictLabelById(districts, activeDistrict)
      : "—";

  const locationReady =
    !!activeState &&
    Number.isInteger(activeDistrict) &&
    activeDistrict >= 1 &&
    !loadingStates &&
    !loadingDistricts;

  const ensurePrimeSession = async (): Promise<number> => {
    await loginMutation.mutateAsync();

    const updatedStore = await queryClient.fetchQuery({
      queryKey: storeKeys.details(),
      queryFn: () => storeAPI.fetchDetails(),
    });

    const merchantLoginId = updatedStore?.primeMerchant?.merchantLoginId;
    let id = getPrimeSenderId(updatedStore);

    if (merchantLoginId) {
      try {
        const shopsRaw = await primeAPI.getMerchantShops(merchantLoginId);
        const primeSenderId = extractSenderIdFromShops(shopsRaw);
        if (primeSenderId) id = primeSenderId;
      } catch {
        // shops فشل — نكمل بـ senderId من store-details
      }
    }

    if (!id) {
      throw new Error("senderId غير موجود — أكمل إعداد Prime من الإعدادات");
    }

    setResolvedSenderId(id);
    return id;
  };

  const handleAutoCreate = async () => {
    if (!locationReady) {
      setShowManual(true);
      toast.error("انتظر تحميل العنوان أو عدّل المحافظة/القضاء يدوياً");
      return;
    }

    try {
      const activeSenderId = await ensurePrimeSession();
      const payload = buildPrimeShipmentFromOrder(
        order,
        activeSenderId,
        activeState,
        activeDistrict,
      );

      await createMutation.mutateAsync(payload);
      toast.success("تم إنشاء شحنة Prime وربطها بالطلب");
      setShowManual(false);
      onUpdated?.();
    } catch (error) {
      toast.error(getPrimeApiError(error, "فشل إنشاء الشحنة"));
    }
  };

  const handleSync = async () => {
    if (!primeShipment?.caseId) {
      toast.error("لا توجد شحنة Prime مربوطة — أنشئ الشحنة أولاً");
      return;
    }

    try {
      await loginMutation.mutateAsync();
      syncMutation.mutate(orderId, {
        onSuccess: () => {
          toast.success("تمت مزامنة حالة الشحنة");
          onUpdated?.();
        },
        onError: (error) =>
          toast.error(getPrimeApiError(error, "فشلت المزامنة")),
      });
    } catch {
      toast.error("فشل تسجيل دخول Prime");
    }
  };

  const busy =
    loginMutation.isPending ||
    createMutation.isPending ||
    syncMutation.isPending;

  return (
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
          <>
            <p className="text-sm text-muted-foreground">
              لا توجد شحنة Prime مربوطة بهذا الطلب بعد.
            </p>

            {canAutoShip && (
              <div className="rounded-xl border bg-slate-50 p-3 text-xs text-slate-600">
                <p>
                  <span className="text-muted-foreground">التوصيل إلى: </span>
                  <span className="font-medium text-slate-800">
                    {deliveryAddress}
                  </span>
                </p>
                <p className="mt-1" dir="ltr">
                  {loadingStates || loadingDistricts ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="size-3 animate-spin" />
                      جاري تحديد المحافظة والقضاء...
                    </span>
                  ) : locationReady ? (
                    <>
                      {activeState} · {districtLabel} ({activeDistrict})
                    </>
                  ) : (
                    "تعذر تحديد العنوان تلقائياً"
                  )}
                </p>
              </div>
            )}
          </>
        )}

        {setupStatus.isReady && senderId && (
          <p className="text-[11px] text-slate-500" dir="ltr">
            senderId: {senderId}
            {setupStatus.merchantLoginId
              ? ` · merchant: ${setupStatus.merchantLoginId}`
              : ""}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {!primeShipment && (
            <Button
              size="sm"
              disabled={!setupStatus.isReady || busy || !locationReady}
              onClick={handleAutoCreate}
            >
              {busy ? (
                <Loader2 className="ml-1 size-3 animate-spin" />
              ) : (
                <Truck className="ml-1 size-3" />
              )}
              شحن تلقائي بـ Prime
            </Button>
          )}
          {!primeShipment && canAutoShip && (
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => setShowManual((v) => !v)}
            >
              {showManual ? "إخفاء التعديل" : "تعديل العنوان"}
            </Button>
          )}
          {primeShipment?.caseId != null && (
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

        {showManual && canAutoShip && (
          <div className="grid gap-2 rounded-xl border p-3">
            <div className="space-y-1">
              <Label className="text-xs">محافظة التوصيل</Label>
              <Select
                value={manualState || autoState || undefined}
                onValueChange={(v) => {
                  setManualState(v);
                  setManualDistrict("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر" />
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
              <Label className="text-xs">قضاء التوصيل</Label>
              <Select
                value={manualDistrict || undefined}
                onValueChange={setManualDistrict}
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
          </div>
        )}

        {!setupStatus.isReady && !primeShipment && (
          <p className="text-xs text-amber-700">
            أكمل إعداد Prime من الإعدادات أولاً (حساب + محل).
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderPrimeShipmentCard;
