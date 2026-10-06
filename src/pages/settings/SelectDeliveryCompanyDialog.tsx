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
import { AlertTriangle, Check, Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFetchDeliveryCompanies } from "@/api/wrappers/delivery-company.wrappers";
import { useUpdateDeliveryCompany } from "@/api/wrappers/settings.wrappers";
import { useCourierAccounts } from "@/api/wrappers/shipping.wrappers";
import type { CourierAccountSummary } from "@/api/types/shipping";
import type { DeliveryCompany } from "@/api/types/delivery-company";
import CourierLogo from "@/components/CourierLogo";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDeliveryCompanyId?: string;
  onSuccess?: () => void;
};

/** Why a company cannot carry this store's parcels, or null. */
type Blocker = { title: string; detail: string };

/**
 * Whether this store could actually ship with a company, and why not.
 *
 * `GET /shipping/couriers/accounts` answers this for **every registered
 * courier**, including the ones the store has not chosen — its own
 * description says that is the whole point, and that answering only for the
 * chosen one "is why a merchant could pick a courier, be told afterwards that
 * registration needs an operator, and be locked out of changing it for 30
 * days". That is exactly what happened: this picker read the company list and
 * nothing else, so every company looked equally available and the refusal
 * arrived on the first real order.
 *
 * Three reasons a company is unusable, and they are different absences:
 *
 * - **No entry at all.** That list is driven by the adapter registry, so a
 *   `DeliveryCompany` row whose `code` nothing implements is simply missing
 *   from it. The row is selectable and every dispatch 422s.
 * - **`accountReady: false`.** The courier requires something of this store
 *   that nobody has recorded — Prime's shop id, Boxy's pick-up location. The
 *   field is deliberately optimistic (a branch the adapter can resolve for
 *   itself counts as ready), so a false here means dispatch really would be
 *   refused.
 * - **`zonesMapped: false`.** Nobody has mapped a province to this courier's
 *   code, so it prices every destination at the fallback fee and refuses
 *   every dispatch. Not a property of the store at all, which is why it is a
 *   separate question: Modon asks nothing of a merchant and can still be
 *   unable to deliver anywhere.
 *
 * Returns null while the readiness answer has not arrived, or if it failed:
 * an unreachable side query must not be able to block every choice.
 */
const blockerFor = (
  company: DeliveryCompany,
  accounts: CourierAccountSummary[] | undefined,
): Blocker | null => {
  if (!accounts) return null;

  const entry = company.code
    ? accounts.find((row) => row.courierCode === company.code)
    : undefined;

  if (!entry) {
    return {
      title: "غير متاحة للشحن حالياً",
      detail:
        "لا يوجد تكامل فعّال مع هذه الشركة على المنصة، فلا يمكن تسجيل الطرود لديها.",
    };
  }

  if (!entry.zonesMapped) {
    return {
      title: `لا تغطي ${entry.displayName} أي محافظة بعد`,
      detail:
        "لم تُربط مناطق التوصيل لهذه الشركة على المنصة، فسيُرفض شحن أي طلب. تواصل مع الدعم.",
    };
  }

  if (entry.accountReady) return null;

  /**
   * Who can finish it, which is the only part the merchant can act on.
   *
   * A courier that supports branches needs an operator to provision one
   * inside the platform's account. One that does not — Modon Express and
   * Al-Waseet, which publish no sub-account endpoint — has nothing for an
   * operator to do, so the merchant's own login is the whole of the setup.
   */
  return entry.supportsBranches
    ? {
        title: `لم يكتمل تسجيل متجرك لدى ${entry.displayName}`,
        detail:
          entry.branchNoteAr?.trim() ||
          "يحتاج التسجيل إلى خطوة من فريق المنصة. تواصل مع الدعم قبل اختيارها.",
      }
    : {
        title: `لم يكتمل ربط حسابك لدى ${entry.displayName}`,
        detail: "اربط حسابك الخاص لدى الشركة من إعدادات المتجر أولاً.",
      };
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
 *
 * **And whether the store can ship with each one is part of that decision.**
 * The choice is held for 30 days, so a company that would refuse every
 * dispatch cannot be offered as though it were equivalent to the rest.
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

  /**
   * Costs no vendor request — it is read from the platform's own rows and,
   * for Prime, one database lookup. Safe to ask every time the dialog opens.
   */
  const { data: accountsData } = useCourierAccounts(open);

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

    // Belt and braces against a readiness answer that arrived after a card
    // was tapped. The server refuses an inactive company; it does not refuse
    // an unprovisioned one, because dispatch is where that is decided.
    const picked = companies.find((c) => c.id === selectedDeliveryCompanyId);
    if (picked && blockerFor(picked, accountsData?.accounts)) {
      toast.error("لا يمكن اختيار هذه الشركة قبل اكتمال تسجيل متجرك لديها.");
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
            const isCurrent = company.id === currentDeliveryCompanyId;
            const blocker = blockerFor(company, accountsData?.accounts);
            /**
             * The store's own company stays choosable even when it is not
             * ready — it is already theirs, so disabling the card would say
             * the current state of the store is not allowed. What a merchant
             * needs here is the reason, which is shown either way.
             */
            const disabled = !!blocker && !isCurrent;

            return (
              <button
                key={company.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-disabled={disabled}
                disabled={isPending || disabled}
                onClick={() => setSelectedDeliveryCompanyId(company.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border-2 p-3 text-right transition-all",
                  "outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed",
                  // Not `disabled:opacity-60`: the blocked card carries the
                  // sentence explaining why, and fading it is what made that
                  // sentence the hardest thing on the card to read.
                  isPending && "disabled:opacity-60",
                  selected
                    ? "border-sky-500 bg-sky-500/10"
                    : disabled
                      ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700",
                )}
              >
                <CourierLogo logo={company.logo} />

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "text-sm font-bold",
                        disabled
                          ? "text-slate-500 dark:text-slate-400"
                          : "text-slate-900 dark:text-slate-100",
                      )}
                    >
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

                  {/*
                    Why this company cannot be chosen, on the card itself.

                    Before the choice and not after it: the server refuses a
                    *withdrawn* company, but it cannot refuse an unprovisioned
                    one — that is decided at dispatch, by which point the
                    30-day change limit has already attached to the choice.
                  */}
                  {blocker && (
                    <span className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 px-2.5 py-2 text-[11px] leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                      <span>
                        <span className="block font-bold">{blocker.title}</span>
                        <span className="mt-0.5 block">{blocker.detail}</span>
                      </span>
                    </span>
                  )}

                  {selected && !blocker && company.code === "prime" && (
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
