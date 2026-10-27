import { useQuery } from "@tanstack/react-query";
import { creditsAPI } from "../endpoints/credits.endpoint";

export const creditKeys = {
  all: ["credits"] as const,
  storeBalance: () => [...creditKeys.all, "store-balance"] as const,
};

/** The store owner's AI builds and editor credits. */
export const useStoreCreditBalance = () => {
  return useQuery({
    queryKey: creditKeys.storeBalance(),
    queryFn: () => creditsAPI.storeBalance(),
    // A server older than the route answers 404; the page just hides the table.
    retry: false,
  });
};
