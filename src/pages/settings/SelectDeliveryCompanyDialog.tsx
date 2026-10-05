import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFetchDeliveryCompanies } from "@/api/wrappers/delivery-company.wrappers";
import { useUpdateDeliveryCompany } from "@/api/wrappers/settings.wrappers";
import CourierLogo from "@/components/CourierLogo";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDeliveryCompanyId?: string;
  onSuccess?: () => void;
};

/**
 * اختيار شركة التوصيل.
 *
 * A list of cards rather than a dropdown, for a reason specific to this
 * choice: there are four companies and each one's description is a paragraph
 * of fee terms — what is charged on a large parcel, what a cash order over a
 * million dinars costs, which of them can quote nothing in advance. A select
 * menu sized itself to the longest of those and spilled across the viewport,
 * and even laid out properly it would hide three of the four behind a click.
 * The terms are the decision, so they are all on screen while it is made.
 */
const CourierPicker = ({
  open,
  onOpenChange,
  currentDeliveryCompanyId,
  onSuccess,
}: Props) => {
  const [selectedDeliveryCompanyId, setSelectedDeliveryCompanyId] = useState<
    string | undefined
  >(currentDeliveryCompanyId);

  const { data: deliveryCompanies, isLoading: isLoadingDeliveryCompanies } =
    useFetchDeliveryCompanies(open);

  const { mutate: updateDeliveryCompany, isPending } =
    useUpdateDeliveryCompany();

  const companies = deliveryCompanies ?? [];

  const handleSubmit = () => {
    if (!selectedDeliveryCompanyId) {
      toast.error("يرجى اختيار شركة التوصيل");
      return;
    }

    if (selectedDeliveryCompanyId === currentDeliveryCompanyId) {
      onOpenChange(false);
      return;
    }

    updateDeliveryCompany(selectedDeliveryCompanyId, {
      onSuccess: () => {
        toast.success("تم تحديث شركة التوصيل بنجاح");
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error: Error) => {
        const apiError = error as Error & {
          response?: { data?: { message?: string } };
        };
        toast.error(
          apiError.response?.data?.message ||
            "فشل في تحديث شركة التوصيل. حاول مرة أخرى.",
        );
      },
    });
  };

  return (
    <>
      <DialogHeader className="space-y-0 text-right">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-sky-500/10">
            <Truck className="size-5 text-sky-500" />
          </span>
          <div className="space-y-0.5">
            <DialogTitle className="text-base">اختر شركة التوصيل</DialogTitle>
            <DialogDescription className="text-right text-xs">
              الشركة التي ستحمل طرود متجرك
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div
        role="radiogroup"
        aria-label="شركة التوصيل"
        className="mt-5 space-y-2.5"
      >
        {isLoadingDeliveryCompanies ? (
          [0, 1, 2].map((key) => (
            <div
              key={key}
              className="h-[78px] animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
            />
          ))
        ) : companies.length === 0 ? (
          // Said plainly rather than left as an empty panel: nothing here is
          // the merchant's to fix, so it names who can.
          <p className="rounded-2xl border-2 border-dashed border-slate-200 p-4 text-center text-[13px] leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
            لا توجد شركات توصيل متاحة حالياً. تواصل مع الدعم لتفعيل الشحن
            لمتجرك.
          </p>
        ) : (
          companies.map((company) => {
            const selected = company.id === selectedDeliveryCompanyId;

            return (
              <button
                key={company.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={isPending}
                onClick={() => setSelectedDeliveryCompanyId(company.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border-2 p-3 text-right transition-all",
                  "outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  selected
                    ? "border-sky-500 bg-sky-500/10"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700",
                )}
              >
                <CourierLogo logo={company.logo} />

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {company.name || "بدون اسم"}
                    </span>
                    {/*
                      The selected card is already filled and outlined, so the
                      tick is confirmation rather than the signal — it is here
                      for the colour-blind reading of the same thing, which
                      the fill alone does not carry.
                    */}
                    {selected && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-500">
                        <Check className="size-3 text-white" />
                      </span>
                    )}
                  </span>

                  {company.description && (
                    /*
                      Clamped until chosen. These run to a full paragraph of
                      fee terms, and four of them at once is a wall nobody
                      reads — but the one being chosen is exactly the one
                      whose terms matter, so it opens in full.
                    */
                    <span
                      className={cn(
                        "mt-1 block text-[11px] leading-relaxed text-slate-500 dark:text-slate-400",
                        !selected && "line-clamp-2",
                      )}
                    >
                      {company.description}
                    </span>
                  )}

                  {selected && company.code === "prime" && (
                    <span className="mt-2 block rounded-xl bg-sky-500/10 px-2.5 py-2 text-[11px] leading-relaxed text-sky-700 dark:text-sky-300">
                      بعد الحفظ، ستجد بطاقة Prime في إعدادات المتجر مع رابط
                      الموقع وزر إكمال الربط.
                    </span>
                  )}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/*
        Said before the choice, not after being refused.

        The server allows one change every 30 days and reports the remainder
        in Arabic when it refuses — but a merchant reads that only once they
        have already picked, which is the wrong moment to learn the choice was
        worth thinking about.
      */}
      {companies.length > 0 && (
        <p className="mt-4 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          يمكن تغيير شركة التوصيل مرة واحدة كل 30 يوماً.
        </p>
      )}

      <DialogFooter className="mt-5 gap-2">
        <Button
          variant="secondary"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedDeliveryCompanyId || isPending}
          className="gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Truck className="size-4" />
              حفظ
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
};

/**
 * The picker is a child, keyed on `open`, so that opening the dialog resets
 * what is selected in it.
 *
 * Reopening has to start from the store's current company again — a merchant
 * who picked one, thought better of it and closed must not find their
 * abandoned choice still armed behind a live حفظ button. Closing does not do
 * that on its own: the content carries an exit animation, so Radix leaves it
 * mounted with `data-state="closed"` rather than unmounting it (verified in
 * the browser — the cards are still in the DOM a second after close). The key
 * is what makes the next open a fresh mount, and it is why the selection can
 * be plain `useState` instead of an effect that re-renders the whole dialog
 * every time `open` flips.
 */
const SelectDeliveryCompanyDialog = (props: Props) => (
  <Dialog open={props.open} onOpenChange={props.onOpenChange}>
    <DialogContent className="gap-0 text-right sm:max-w-lg">
      <CourierPicker key={props.open ? "open" : "closed"} {...props} />
    </DialogContent>
  </Dialog>
);

export default SelectDeliveryCompanyDialog;
