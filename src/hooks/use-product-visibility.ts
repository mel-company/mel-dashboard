import { useState } from "react";
import { toast } from "sonner";
import { useUpdateProduct } from "@/api/wrappers/product.wrappers";

/** The API's own wording when it has some, rather than a generic failure. */
function apiMessage(error: unknown): string | undefined {
  const message = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  return typeof message === "string" && message.trim() ? message : undefined;
}

/**
 * Show or hide a product from the storefront — `Product.enabled`.
 *
 * Until this existed, the only writer of `enabled` in the dashboard was the
 * hide button inside the delete modal, and it only ever wrote `false`:
 * `AddProduct` sets it true once at creation and `EditProduct` never sends the
 * field at all. Hiding was a one-way door, with nothing anywhere to open it.
 *
 * The optimistic value is held here so a switch flips under the merchant's
 * finger rather than after the round trip, and is rolled back on failure —
 * the same shape `GroupRow` already uses for a category group.
 */
export function useProductVisibility(enabled: boolean) {
  const { mutate, isPending } = useUpdateProduct();
  const [optimistic, setOptimistic] = useState<boolean | null>(null);

  const visible = optimistic ?? enabled;

  const setVisible = (id: string, next: boolean) => {
    setOptimistic(next);
    mutate(
      { id, data: { enabled: next } },
      {
        /*
         * Hold the override until the refetched row carries the new value.
         *
         * `enabled` is the cached list row, and it keeps the old value for as
         * long as the refetch is in flight — so dropping the override the
         * moment the request succeeded flipped the switch back under the
         * merchant's finger before it settled. `useUpdateProduct` awaits its
         * own invalidation, and React Query awaits that before running this —
         * so by here the refetched row is in place and the prop can be
         * trusted again.
         */
        onSuccess: async () => {
          toast.success(
            next ? "تم إظهار المنتج للعملاء" : "تم إخفاء المنتج — لن يظهر للعملاء",
          );
          setOptimistic(null);
        },
        onError: (error: unknown) => {
          setOptimistic(null);
          toast.error(
            apiMessage(error) ??
              (next ? "فشل إظهار المنتج" : "فشل إخفاء المنتج"),
          );
        },
      },
    );
  };

  return { visible, setVisible, isPending };
}
