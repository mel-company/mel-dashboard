import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MapPin,
  Phone,
  LifeBuoy,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import {
  usePrimeSetupStatus,
  type PrimeSetupStep,
} from "@/hooks/use-prime-setup-status";
import { cn } from "@/lib/utils";

const PRIME_WEBSITE = "https://prime.iq";

type Props = {
  /** Opens «موقع الفرع» so the merchant finishes the map step in one tap. */
  onOpenLocation?: () => void;
  /** Closes the shipping dialog so they can fill phone under الإعدادات العامة. */
  onRequestPhone?: () => void;
};

const stepAction = (
  step: PrimeSetupStep,
  handlers: { onOpenLocation?: () => void; onRequestPhone?: () => void },
) => {
  if (step.done || !step.action) return null;

  if (step.action === "location" && handlers.onOpenLocation) {
    return (
      <Button
        type="button"
        size="sm"
        onClick={handlers.onOpenLocation}
        className="mt-2 h-9 gap-1.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700"
      >
        <MapPin className="size-3.5" />
        تحديد موقع الفرع
      </Button>
    );
  }

  if (step.action === "phone") {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => {
          handlers.onRequestPhone?.();
          toast.info(
            "افتح تبويب «الإعدادات العامة» وأضف رقم الهاتف، ثم ارجع واحفظ موقع الفرع.",
          );
        }}
        className="mt-2 h-9 gap-1.5 rounded-xl border-amber-300 bg-white text-amber-900 hover:bg-amber-50"
      >
        <Phone className="size-3.5" />
        أين أضيف رقم الهاتف؟
      </Button>
    );
  }

  if (step.action === "support") {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-amber-800">
        <LifeBuoy className="size-3.5 shrink-0" />
        تواصل مع دعم MEL لربط منطقتك
      </p>
    );
  }

  return null;
};

/**
 * حالة ربط Prime — checklist بدل جملة عامة.
 *
 * Merchants were failing on save with English 422s (phone / zones / district).
 * This card lists the same requirements up front and points each incomplete
 * step at one action.
 */
const PrimeIntegrationCard = ({ onOpenLocation, onRequestPhone }: Props) => {
  const { data: storeDetails } = useFetchStoreDetails();
  const setup = usePrimeSetupStatus();

  const deliveryCompany = storeDetails?.deliveryCompany;
  const website = deliveryCompany?.website || PRIME_WEBSITE;
  const logo = deliveryCompany?.logo;
  const companyName = deliveryCompany?.name || setup.displayName || "Prime";

  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 dark:border-sky-900/50 dark:bg-sky-950/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {logo ? (
            <img
              src={logo}
              alt={companyName}
              className="size-10 rounded-xl bg-white object-contain p-1"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-sky-700">
              P
            </div>
          )}
          <div className="min-w-0 text-right">
            <p className="text-sm font-semibold text-sky-950 dark:text-sky-100">
              {companyName}
            </p>
            <p className="text-[11px] leading-snug text-sky-700/80 dark:text-sky-300/80">
              خطوات تفعيل الشحن لمتجرك
            </p>
          </div>
        </div>

        {setup.isLoading ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-sky-600" />
        ) : setup.isReady ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="size-3" />
            جاهز للشحن
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            <AlertCircle className="size-3" />
            يتطلب إكمالاً
          </span>
        )}
      </div>

      <ol className="space-y-2">
        {setup.steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              "rounded-xl px-3 py-2.5 text-right",
              step.done
                ? "bg-white/70 dark:bg-slate-900/50"
                : "bg-amber-50/90 ring-1 ring-amber-200/80 dark:bg-amber-950/30 dark:ring-amber-900/60",
            )}
          >
            <div className="flex items-start gap-2">
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  step.done
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-200 text-amber-900",
                )}
              >
                {step.done ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-[13px] font-semibold",
                    step.done
                      ? "text-slate-700 dark:text-slate-200"
                      : "text-amber-950 dark:text-amber-100",
                  )}
                >
                  {step.title}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-[11px] leading-relaxed",
                    step.done
                      ? "text-slate-500 dark:text-slate-400"
                      : "text-amber-900/85 dark:text-amber-200/90",
                  )}
                >
                  {step.detail}
                </p>
                {stepAction(step, { onOpenLocation, onRequestPhone })}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {setup.isReady && setup.merchantLoginId ? (
        <div
          className="rounded-xl bg-white/80 px-3 py-2 text-[11px] text-slate-600 dark:bg-slate-900/60 dark:text-slate-300"
          dir="ltr"
        >
          <p>merchant: {setup.merchantLoginId}</p>
          {setup.senderId != null && <p>senderId: {setup.senderId}</p>}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" asChild>
          <a href={website} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="ml-1 size-3" />
            زيارة موقع {companyName}
          </a>
        </Button>
      </div>
    </div>
  );
};

export default PrimeIntegrationCard;
