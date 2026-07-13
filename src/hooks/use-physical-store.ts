import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import { parseBooleanFlag } from "@/utils/parse-boolean";

export function usePhysicalStoreEnabled() {
  const { data: storeDetails, isLoading } = useFetchStoreDetails();

  return {
    isPhysicalStore: parseBooleanFlag(
      storeDetails?.is_physical_store ?? storeDetails?.isPhysicalStore,
    ),
    isLoading,
    storeDetails,
  };
}
