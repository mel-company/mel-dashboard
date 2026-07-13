import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { primeAPI } from "@/api/endpoints/prime.endpoints";
import type {
  CalculatePrimeChargesInput,
  CreatePrimeMerchantInput,
  CreatePrimeShipmentInput,
  CreatePrimeShopInput,
} from "@/api/types/prime";

const LOOKUP_STALE_TIME = 1000 * 60 * 60 * 24;

export const primeKeys = {
  all: ["prime"] as const,
  states: () => [...primeKeys.all, "states"] as const,
  districts: (stateCode: string) =>
    [...primeKeys.all, "districts", stateCode] as const,
  branches: () => [...primeKeys.all, "branches"] as const,
  merchants: () => [...primeKeys.all, "merchants"] as const,
  shops: (merchantLoginId: string) =>
    [...primeKeys.all, "shops", merchantLoginId] as const,
  orderShipment: (orderId: string) =>
    [...primeKeys.all, "order-shipment", orderId] as const,
};

export const usePrimeStates = (enabled = true) =>
  useQuery({
    queryKey: primeKeys.states(),
    queryFn: () => primeAPI.getStates(),
    enabled,
    staleTime: LOOKUP_STALE_TIME,
  });

export const usePrimeDistricts = (stateCode: string, enabled = true) =>
  useQuery({
    queryKey: primeKeys.districts(stateCode),
    queryFn: () => primeAPI.getDistricts(stateCode),
    enabled: enabled && !!stateCode,
    staleTime: LOOKUP_STALE_TIME,
  });

export const usePrimeBranches = (enabled = true) =>
  useQuery({
    queryKey: primeKeys.branches(),
    queryFn: () => primeAPI.getBranches(),
    enabled,
    staleTime: LOOKUP_STALE_TIME,
  });

/**
 * قائمة كل التجار تحت Aggregator — للإدارة فقط.
 * لا تستخدمها لاختيار تاجر المتجر؛ استخدم prime_merchant من store-details.
 */
export const usePrimeMerchants = (enabled = true) =>
  useQuery({
    queryKey: primeKeys.merchants(),
    queryFn: () => primeAPI.getMerchants(),
    enabled,
  });

export const usePrimeMerchantShops = (
  merchantLoginId: string,
  enabled = true,
) =>
  useQuery({
    queryKey: primeKeys.shops(merchantLoginId),
    queryFn: () => primeAPI.getMerchantShops(merchantLoginId),
    enabled: enabled && !!merchantLoginId,
  });

export const usePrimeOrderShipment = (orderId: string, enabled = true) =>
  useQuery({
    queryKey: primeKeys.orderShipment(orderId),
    queryFn: () => primeAPI.getOrderShipment(orderId),
    enabled: enabled && !!orderId,
  });

export const usePrimeLogin = () =>
  useMutation({
    mutationFn: () => primeAPI.login(),
  });

export const usePrimeSyncLookups = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => primeAPI.syncLookups(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: primeKeys.all });
    },
  });
};

export const useCreatePrimeMerchant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePrimeMerchantInput) =>
      primeAPI.createMerchant(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: primeKeys.merchants() });
    },
  });
};

export const useCreatePrimeShop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      merchantLoginId,
      body,
    }: {
      merchantLoginId: string;
      body: CreatePrimeShopInput;
    }) => primeAPI.createShop(merchantLoginId, body),
    onSuccess: (_, { merchantLoginId }) => {
      queryClient.invalidateQueries({
        queryKey: primeKeys.shops(merchantLoginId),
      });
    },
  });
};

export const useCalculatePrimeCharges = () =>
  useMutation({
    mutationFn: (body: CalculatePrimeChargesInput) =>
      primeAPI.calculateCharges(body),
  });

export const useCreatePrimeShipment = () =>
  useMutation({
    mutationFn: (body: CreatePrimeShipmentInput) =>
      primeAPI.createShipment(body),
  });

export const useSyncPrimeOrderShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => primeAPI.syncOrderShipment(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({
        queryKey: primeKeys.orderShipment(orderId),
      });
    },
  });
};
