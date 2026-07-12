import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";

function parseBooleanFlag(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0" || normalized === "") {
      return false;
    }
  }
  return Boolean(value);
}

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
