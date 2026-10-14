import { useEffect } from "react";
import { useUpdateCustomer } from "@/api/wrappers/customer.wrappers";

/** Shared across rows so the same customer is not written twice in one session. */
const syncedKeys = new Set<string>();

/**
 * Write the delivery line onto `user.location` so the customers table can
 * show «الموقع» without the merchant pressing save.
 *
 * The list API does not embed orders; details and the orders list do. Once we
 * know the address, we persist it quietly (only when still empty).
 */
export function useSyncCustomerLocation(
  customerId: string | undefined | null,
  location: string,
  options?: { onlyIfEmpty?: boolean; storedLocation?: string },
) {
  const { mutate } = useUpdateCustomer();

  const trimmed = location.trim();
  const stored = (options?.storedLocation ?? "").trim();
  const onlyIfEmpty = options?.onlyIfEmpty ?? true;

  useEffect(() => {
    if (!customerId || !trimmed) return;
    if (onlyIfEmpty && stored) return;
    if (!onlyIfEmpty && stored === trimmed) return;

    const key = `${customerId}:${trimmed}`;
    if (syncedKeys.has(key)) return;
    syncedKeys.add(key);

    mutate(
      { id: customerId, data: { location: trimmed } },
      {
        onError: () => {
          syncedKeys.delete(key);
        },
      },
    );
  }, [customerId, trimmed, stored, onlyIfEmpty, mutate]);
}
