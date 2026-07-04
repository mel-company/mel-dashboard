import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";

export function usePhysicalStoreEnabled() {
  const { data: storeDetails, isLoading } = useFetchStoreDetails();

  return {
    isPhysicalStore: Boolean(
      storeDetails?.is_physical_store ?? storeDetails?.isPhysicalStore,
    ),
    isLoading,
    storeDetails,
  };
}
