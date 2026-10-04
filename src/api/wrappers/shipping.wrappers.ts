import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shippingAPI } from "@/api/endpoints/shipping.endpoints";
import { orderKeys } from "@/api/wrappers/order.wrappers";
import type {
  CourierShipment,
  CreateShipmentInput,
} from "@/api/types/shipping";

export const shippingKeys = {
  all: ["shipping"] as const,
  activeCourier: () => [...shippingKeys.all, "active-courier"] as const,
  accounts: () => [...shippingKeys.all, "accounts"] as const,
  shipment: (orderId: string) =>
    [...shippingKeys.all, "shipment", orderId] as const,
  tracking: (orderId: string) =>
    [...shippingKeys.all, "tracking", orderId] as const,
};

/**
 * Which courier this store uses, and what it can be asked to do.
 *
 * Cached for a while: it changes when a merchant switches company in
 * settings, not between orders, and every order page would otherwise re-ask.
 */
const ACTIVE_COURIER_STALE_TIME = 1000 * 60 * 5;

export const useActiveCourier = (enabled = true) =>
  useQuery({
    queryKey: shippingKeys.activeCourier(),
    queryFn: () => shippingAPI.getActiveCourier(),
    enabled,
    staleTime: ACTIVE_COURIER_STALE_TIME,
  });

export const useOrderShipment = (orderId: string, enabled = true) =>
  useQuery({
    queryKey: shippingKeys.shipment(orderId),
    queryFn: () => shippingAPI.getShipment(orderId),
    enabled: enabled && !!orderId,
  });

/**
 * The timeline, fetched only when a merchant asks to see it.
 *
 * A live read from the courier — nothing stores a tracking history here — so
 * it is not something to fire on every render of an order page.
 */
export const useOrderTracking = (orderId: string, enabled = false) =>
  useQuery({
    queryKey: shippingKeys.tracking(orderId),
    queryFn: () => shippingAPI.trackShipment(orderId),
    enabled: enabled && !!orderId,
  });

/**
 * Everything that changes a parcel invalidates the order too.
 *
 * The order page renders the parcel's status beside the order's own, and for
 * Prime the server also keeps its legacy shipment row in step — which the
 * order serializer reads. Leaving the order cached shows the two disagreeing.
 */
const useParcelMutation = <TArgs, TResult>(
  orderId: string,
  run: (args: TArgs) => Promise<TResult>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: run,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: shippingKeys.shipment(orderId),
      });
      void queryClient.invalidateQueries({
        queryKey: shippingKeys.tracking(orderId),
      });
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
};

export const useCreateShipment = (orderId: string) =>
  useParcelMutation(orderId, (body: CreateShipmentInput = {}) =>
    shippingAPI.createShipment(orderId, body),
  );

// `void` rather than an inferred arg type, so these are callable as
// `mutateAsync()` — neither takes anything beyond the order already bound.
export const useSyncShipment = (orderId: string) =>
  useParcelMutation<void, CourierShipment>(orderId, () =>
    shippingAPI.syncShipment(orderId),
  );

export const useCancelShipment = (orderId: string) =>
  useParcelMutation<void, CourierShipment>(orderId, () =>
    shippingAPI.cancelShipment(orderId),
  );

export const useShipmentLabel = (orderId: string) =>
  useParcelMutation(orderId, (size?: string) =>
    shippingAPI.getLabel(orderId, size),
  );

export const useCourierAccounts = (enabled = true) =>
  useQuery({
    queryKey: shippingKeys.accounts(),
    queryFn: () => shippingAPI.getAccounts(),
    enabled,
  });

/**
 * Storing or forgetting a courier login changes which account the platform
 * dispatches as, so the active-courier answer goes stale with it.
 */
const useCredentialMutation = <TArgs, TResult>(
  run: (args: TArgs) => Promise<TResult>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: run,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: shippingKeys.accounts() });
      void queryClient.invalidateQueries({
        queryKey: shippingKeys.activeCourier(),
      });
    },
  });
};

export const useSetCourierCredentials = () =>
  useCredentialMutation(
    (args: { code: string; username: string; password: string }) =>
      shippingAPI.setCredentials(args.code, {
        username: args.username,
        password: args.password,
      }),
  );

export const useClearCourierCredentials = () =>
  useCredentialMutation((code: string) => shippingAPI.clearCredentials(code));
