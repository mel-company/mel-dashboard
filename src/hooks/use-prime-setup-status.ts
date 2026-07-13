import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import {
  hasPrimeAccount,
  isPrimeReadyForShipping,
} from "@/api/types/store";

type PrimeSetupStatus = {
  isLoading: boolean;
  isReady: boolean;
  hasAccount: boolean;
  needsShop: boolean;
  merchantLoginId?: string;
  senderId?: number;
  merchantName?: string;
  active?: boolean;
};

export function usePrimeSetupStatus(): PrimeSetupStatus {
  const { data: storeDetails, isLoading } = useFetchStoreDetails();
  const primeMerchant = storeDetails?.primeMerchant;
  const hasAccount = hasPrimeAccount(storeDetails);
  const isReady = isPrimeReadyForShipping(storeDetails);

  return {
    isLoading,
    isReady,
    hasAccount,
    needsShop: hasAccount && !isReady,
    merchantLoginId: primeMerchant?.merchantLoginId,
    senderId: primeMerchant?.senderId,
    merchantName: primeMerchant?.name,
    active: primeMerchant?.active,
  };
}
