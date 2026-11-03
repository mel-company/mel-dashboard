import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MapPin,
  Phone,
  LifeBuoy,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import { useEnsureCourierBranch } from "@/api/wrappers/shipping.wrappers";
import {
  useCourierSetupStatus,
  type CourierSetupRequirement,
} from "@/hooks/use-courier-setup-status";
import { cn } from "@/lib/utils";

type Props = {
  onOpenLocation?: () => void;
  onRequestPhone?: () => void;
  /** Scroll / focus the credentials form in CourierAccountCard. */
  onRequestCredentials?: () => void;
};

const stepAction = (
  step: CourierSetupRequirement,
  handlers: {
    onOpenLocation?: () => void;
    onRequestPhone?: () => void;
    onEnsure?: () => void;
    onCredentials?: () => void;
    ensuring?: boolean;
  },
) => {
  if (step.done || !step.action) return null;

  // Labels follow GET /shipping/couriers/setup — one button per `action`.
  if (step.action === "ensure" && handlers.onEnsure) {
    return (
      <Button
        type="button"
        size="sm"
        onClick={handlers.onEnsure}
        disabled={handlers.ensuring}
        className="mt-2 h-9 gap-1.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700"
      >
        {handlers.ensuring ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <CheckCircle2 className="size-3.5" />
        )}
        {handlers.ensuring ? "جاري التفعيل…" : "تفعيل الشحن الآن"}
      </Button>
    );
  }

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
            "افتح تبويب «الإعدادات العامة» وأضف رقم الهاتف، ثم ارجع لتفعيل الشحن.",
          );
        }}
        className="mt-2 h-9 gap-1.5 rounded-xl border-amber-300 bg-white text-amber-900 hover:bg-amber-50"
      >
        <Phone className="size-3.5" />
        وين أضيف رقم الهاتف
      </Button>
    );
  }

  if (step.action === "credentials" && handlers.onCredentials) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handlers.onCredentials}
        className="mt-2 h-9 gap-1.5 rounded-xl border-sky-200 bg-white text-sky-800 hover:bg-sky-50"
      >
        <KeyRound className="size-3.5" />
        ربط حسابي (مدن/وسيط)
      </Button>
    );
  }

  if (step.action === "support") {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-amber-800">
        <LifeBuoy className="size-3.5 shrink-0" />
        تواصل مع الدعم
      </p>
    );
  }

  return null;
};

/**
 * قائمة شروط التفعيل من `GET /shipping/couriers/setup`.
 * نفس البطاقة لكل الشركات — الزر يعتمد على `action` فقط.
 */
const CourierSetupCard = ({
  onOpenLocation,
  onRequestPhone,
  onRequestCredentials,
}: Props) => {
  const { data: storeDetails } = useFetchStoreDetails();
  const { setup, isLoading, ready, requirements, displayName, refetch } =
    useCourierSetupStatus();
  const ensureBranch = useEnsureCourierBranch();
  const [ensureErrorAr, setEnsureErrorAr] = useState<string | null>(null);

  if (!setup?.selected || !setup.courierCode) return null;

  const companyName =
    setup.companyName || displayName || storeDetails?.deliveryCompany?.name || "شركة الشحن";
  const website = storeDetails?.deliveryCompany?.website;
  const logo = storeDetails?.deliveryCompany?.logo;
  const bannerError = ensureErrorAr || setup.errorAr;

  const activate = async () => {
    setEnsureErrorAr(null);
    try {
      await ensureBranch.mutateAsync();
      setEnsureErrorAr(null);
      toast.success(`تم تفعيل الشحن لدى ${companyName}.`);
      // Success already seeds setup in the mutation; refetch keeps accounts/branch in sync.
      void refetch();
    } catch (error) {
      const data = (
        error as {
          response?: {
            data?: {
              message?: unknown;
              errorAr?: unknown;
              setup?: { errorAr?: unknown } | unknown;
            };
          };
        }
      )?.response?.data;
      // Prefer the Arabic sentence the API returned (banner + toast stay in sync).
      const fromSetup =
        data?.setup &&
        typeof data.setup === "object" &&
        typeof (data.setup as { errorAr?: unknown }).errorAr === "string"
          ? String((data.setup as { errorAr: string }).errorAr).trim()
          : "";
      const message =
        (typeof data?.errorAr === "string" && data.errorAr.trim()) ||
        fromSetup ||
        (typeof data?.message === "string" && data.message.trim()) ||
        "تعذر التفعيل. تأكد من بيانات المتجر وحاول مرة أخرى.";
      setEnsureErrorAr(message);
      toast.error(message);
      // Mutation onError already wrote `setup` from the 422 body — no refetch
      // that would clear step.errorAr.
    }
  };

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
              {companyName.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0 text-right">
            <p className="text-sm font-semibold text-sky-950 dark:text-sky-100">
              {companyName}
            </p>
            <p className="text-[11px] leading-snug text-sky-700/80 dark:text-sky-300/80">
              {setup.summaryAr || "خطوات تفعيل الشحن لمتجرك"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-sky-600" />
        ) : ready ? (
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

      {bannerError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-[12px] leading-relaxed text-red-800 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-900/60"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{bannerError}</p>
        </div>
      ) : null}

      <ol className="space-y-2">
        {requirements.map((step, index) => {
          const failed = !step.done && !!step.errorAr;
          return (
          <li
            key={step.id}
            className={cn(
              "rounded-xl px-3 py-2.5 text-right",
              step.done
                ? "bg-white/70 dark:bg-slate-900/50"
                : failed
                  ? "bg-red-50/90 ring-1 ring-red-200/80 dark:bg-red-950/30 dark:ring-red-900/60"
                  : "bg-amber-50/90 ring-1 ring-amber-200/80 dark:bg-amber-950/30 dark:ring-amber-900/60",
            )}
          >
            <div className="flex items-start gap-2">
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  step.done
                    ? "bg-emerald-100 text-emerald-700"
                    : failed
                      ? "bg-red-200 text-red-900"
                      : "bg-amber-200 text-amber-900",
                )}
              >
                {step.done ? (
                  <CheckCircle2 className="size-3.5" />
                ) : failed ? (
                  <AlertCircle className="size-3.5" />
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
                      : failed
                        ? "text-red-950 dark:text-red-100"
                        : "text-amber-950 dark:text-amber-100",
                  )}
                >
                  {step.titleAr}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-[11px] leading-relaxed",
                    step.done
                      ? "text-slate-500 dark:text-slate-400"
                      : failed
                        ? "text-red-900/85 dark:text-red-200/90"
                        : "text-amber-900/85 dark:text-amber-200/90",
                  )}
                >
                  {step.detailAr}
                </p>
                {failed ? (
                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-red-700 dark:text-red-300">
                    {step.errorAr}
                  </p>
                ) : null}
                {stepAction(step, {
                  onOpenLocation,
                  onRequestPhone,
                  onEnsure: activate,
                  onCredentials: onRequestCredentials,
                  ensuring: ensureBranch.isPending,
                })}
              </div>
            </div>
          </li>
          );
        })}
      </ol>

      {website ? (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href={website} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="ml-1 size-3" />
              زيارة موقع {companyName}
            </a>
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default CourierSetupCard;
