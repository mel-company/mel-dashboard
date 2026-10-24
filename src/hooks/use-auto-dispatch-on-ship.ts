import { toast } from "sonner";
import {
  useActiveCourier,
  useCreateShipment,
  useOrderShipment,
} from "@/api/wrappers/shipping.wrappers";
import { usePlanFeature } from "@/hooks/use-plan-limits";

function shipErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
}

/**
 * After the merchant presses «شحن الطلب» (order → SHIPPED), register the
 * parcel with the store's courier when there is not one yet.
 *
 * Dispatch still takes an explicit act — the status button — it just no
 * longer needs a second «شحن الطلب» on the shipping card for the common
 * Prime path. Costs money once a driver holds it, so we never fire this
 * from PENDING/PROCESSING alone.
 */
export function useAutoDispatchOnShip(orderId: string, enabled = true) {
  const { data: courier } = useActiveCourier(enabled && !!orderId);
  const { data: shipment } = useOrderShipment(orderId, enabled && !!orderId);
  const createShipment = useCreateShipment(orderId);
  const courierAllowed = usePlanFeature("courier_integrations");

  const dispatchIfNeeded = () => {
    if (!orderId) return;
    if (shipment) return;

    if (!courier || courier.selected !== true) return;

    // A plan without courier integrations ships by hand, like a company
    // with no integration.
    if (!courier.integrated || !courierAllowed) {
      toast.message(
        "تم تحديث حالة الطلب. سجّل الطرد يدوياً لدى شركة التوصيل إن لزم.",
      );
      return;
    }

    if (!courier.accountReady) {
      toast.error(
        "تم شحن الطلب، لكن إعدادات شركة الشحن غير مكتملة. أكملها من الإعدادات ثم سجّل الطرد من بطاقة الشحن.",
      );
      return;
    }

    createShipment.mutate(
      {},
      {
        onSuccess: () => {
          toast.success(
            `تم تسجيل الطرد لدى ${courier.displayName || "شركة الشحن"} تلقائياً.`,
          );
        },
        onError: (err) => {
          toast.error(
            shipErrorMessage(
              err,
              "تم شحن الطلب، لكن تعذر تسجيل الطرد تلقائياً. سجّله من بطاقة الشحن.",
            ),
          );
        },
      },
    );
  };

  return {
    dispatchIfNeeded,
    isDispatching: createShipment.isPending,
  };
}
