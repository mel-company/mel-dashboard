import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import { resolveAssetBaseUrl } from "@/utils/image-url";

function pickBaseUrl(...values: Array<string | null | undefined>): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

export function useImageBaseUrl(listBaseUrl?: string | null): string {
  const { data: storeDetails } = useFetchStoreDetails();
  return resolveAssetBaseUrl(
    pickBaseUrl(
      listBaseUrl,
      import.meta.env.VITE_PUBLIC_URL,
      storeDetails?.baseUrl,
      storeDetails?.base_url,
    ),
  );
}
