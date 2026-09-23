import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Cancel01Icon,
  Loading03Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DomainBrandPanel from "./DomainBrandPanel";
import DomainPathPicker, { type DomainPath } from "./DomainPathPicker";
import DomainSettingsFields from "./DomainSettingsFields";
import BringYourOwnDomain from "./BringYourOwnDomain";
import DomainStatusBadge from "./DomainStatusBadge";
import { DomainNote } from "./DomainNotes";
import PaymentProviderPicker, {
  paymentProviderLabel,
} from "./PaymentProviderPicker";
import {
  useFindDomainDetails,
  useUpdateDomain,
} from "@/api/wrappers/domain.wrappers";
import { useInitStorePlatformPayment } from "@/api/wrappers/platform-payment.wrapper";
import type { PlatformPaymentProvider } from "@/api/endpoints/platform-payment.endpoint";
import { normalizePlatformSlug, useDomainCheck } from "@/hooks/useDomainCheck";
import { formatUsd, getDomainPurchasePricing } from "@/utils/domainPricing";
import { AR_LATN_LOCALE } from "@/utils/format-currency";

export const DOMAIN_PURCHASE_RETURN_KEY = "mel_domain_purchase_return";
export const LAST_PAYMENT_ID_KEY = "mel_last_platform_payment_id";

/** A slug rename re-points DNS, so it is rate-limited to once a month. */
const RENAME_COOLDOWN_DAYS = 30;

const CurrentValue = ({
  label,
  value,
  accessory,
}: {
  label: string;
  value: string;
  accessory?: React.ReactNode;
}) => (
  <div className="bg-blue-500/5 rounded-e-lg border-s-4 border-blue-500 px-4 py-3 dark:bg-slate-900">
    <p className="text-[13px] text-slate-500 dark:text-slate-400">{label}</p>
    <div className="mt-1 flex items-center gap-2">
      <code
        dir="ltr"
        className="min-w-0 text-end flex-1 truncate text-sm font-medium text-slate-900 dark:text-slate-100"
        title={value}
      >
        {value}
      </code>
      {accessory}
    </div>
  </div>
);

type DomainSettingsSectionProps = {
  onClose?: () => void;
};

const DomainSettingsSection = ({ onClose }: DomainSettingsSectionProps) => {
  const { data: domainDetails, isLoading } = useFindDomainDetails();
  const updateDomain = useUpdateDomain();
  const initPayment = useInitStorePlatformPayment();

  const [domainPath, setDomainPath] = useState<DomainPath>("subdomain");
  const [paymentProvider, setPaymentProvider] =
    useState<PlatformPaymentProvider | null>(null);

  const {
    domain,
    domainChecked,
    domainAvailable,
    isCheckingDomain,
    dynadotResult,
    setDomain,
    handleDomainChange,
    handleDomainTypeChange,
    checkDomain,
    resetCheck,
  } = useDomainCheck();

  const domainType = domainPath === "buy" ? "custom" : "subdomain";
  const platformSlug = normalizePlatformSlug(domainDetails?.domain);
  const customDomain = domainDetails?.customDomain?.trim() || "";

  const lastUpdate = domainDetails?.domain_last_update;
  const canRenameSlug = useMemo(() => {
    if (!lastUpdate) return true;
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSinceUpdate >= RENAME_COOLDOWN_DAYS;
  }, [lastUpdate]);

  const formattedLastUpdate = lastUpdate
    ? new Date(lastUpdate).toLocaleDateString(AR_LATN_LOCALE, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "لم يتم التحديث";

  const normalizedInput = domain.trim().toLowerCase();
  const customDomainAlreadyLinked = customDomain === normalizedInput;
  /**
   * The slug is what gets checked for availability, so it has to be what gets
   * saved too — submitting the raw field would send a value the server never
   * confirmed was free.
   */
  const slugInput = normalizePlatformSlug(domain);
  const slugChanged = slugInput !== platformSlug.toLowerCase();
  const pricing =
    domainPath === "buy" ? getDomainPurchasePricing(dynadotResult?.price) : null;

  const canPurchaseCustomDomain =
    domainPath === "buy" &&
    domainChecked &&
    domainAvailable === true &&
    !customDomainAlreadyLinked &&
    pricing != null;

  const canUpdateSubdomain =
    domainPath === "subdomain" &&
    slugChanged &&
    domainChecked &&
    domainAvailable === true &&
    canRenameSlug;

  const canSave = canPurchaseCustomDomain || canUpdateSubdomain;
  const isSaving = updateDomain.isPending || initPayment.isPending;

  /**
   * What each path starts with. The subdomain path edits something that already
   * exists, so it opens on the current slug; buying opens empty because the
   * point is to pick a domain the store does not have yet.
   */
  const defaultForPath = useCallback(
    (path: DomainPath) => (path === "subdomain" ? platformSlug : ""),
    [platformSlug],
  );

  /** Details arrive after mount, so the first value has to be filled in late. */
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || isLoading) return;
    seeded.current = true;
    const initial = defaultForPath(domainPath);
    if (initial) setDomain(initial);
  }, [isLoading, domainPath, defaultForPath, setDomain]);

  const selectPath = (path: DomainPath) => {
    setDomainPath(path);
    // The paths accept different things — a bare slug vs a full domain — so a
    // value typed for one must not survive into the next.
    handleDomainChange(defaultForPath(path));
    if (path !== "owned") {
      handleDomainTypeChange(path === "buy" ? "custom" : "subdomain");
    }
  };

  const buyDomain = () => {
    if (!pricing) {
      toast.error("تعذر حساب سعر الدومين. أعد التحقق من التوفر.");
      return;
    }
    if (!paymentProvider) {
      toast.error("الرجاء اختيار طريقة الدفع");
      return;
    }

    sessionStorage.setItem(
      DOMAIN_PURCHASE_RETURN_KEY,
      JSON.stringify({ domain: normalizedInput }),
    );

    initPayment.mutate(
      {
        type: "DOMAIN_REGISTRATION",
        domain: normalizedInput,
        provider: paymentProvider,
        returnBaseUrl: `${window.location.origin}/payment/return`,
      },
      {
        onSuccess: (data: any) => {
          if (!data?.redirectUrl) {
            toast.error("تعذر بدء عملية الدفع");
            sessionStorage.removeItem(DOMAIN_PURCHASE_RETURN_KEY);
            return;
          }
          if (data?.id) {
            sessionStorage.setItem(LAST_PAYMENT_ID_KEY, String(data.id));
          }
          window.location.href = data.redirectUrl;
        },
        onError: (error: any) => {
          sessionStorage.removeItem(DOMAIN_PURCHASE_RETURN_KEY);
          const message = error?.response?.data?.message;
          toast.error(
            Array.isArray(message)
              ? message.join(" — ")
              : message || "تعذر بدء الدفع. حاول مرة أخرى.",
          );
        },
      },
    );
  };

  const renameSlug = () => {
    if (!canRenameSlug) {
      toast.error(
        `لا يمكن تحديث النطاق. يجب الانتظار ${RENAME_COOLDOWN_DAYS} يومًا على الأقل من آخر تحديث.`,
      );
      return;
    }

    updateDomain.mutate(
      { current: platformSlug, next: slugInput },
      {
        onSuccess: () => {
          toast.success("تم تحديث النطاق بنجاح");
          resetCheck();
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message;
          toast.error(
            Array.isArray(message)
              ? message.join(" — ")
              : message || "حدث خطأ في تحديث النطاق",
          );
        },
      },
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (domainPath === "buy" && customDomainAlreadyLinked) {
      toast.info("هذا الدومين المخصص مربوط بالفعل");
      return;
    }
    if (domainPath === "subdomain" && !slugChanged) {
      toast.info("لم يتم تغيير النطاق");
      return;
    }
    if (!domainChecked || domainAvailable !== true) {
      toast.error("الرجاء التحقق من توفر الدومين أولاً");
      return;
    }

    if (domainPath === "buy") {
      buyDomain();
      return;
    }
    renameSlug();
  };

  const body = isLoading ? (
    <div className="space-y-3">
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  ) : (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <CurrentValue
          label="نطاق المنصة الحالي"
          value={platformSlug ? `${platformSlug}.mel.iq` : "—"}
        />
        <CurrentValue
          label="الدومين المخصص"
          value={customDomain || "غير مربوط"}
          accessory={
            customDomain ? (
              <DomainStatusBadge status={domainDetails?.ssl?.status} />
            ) : null
          }
        />
      </div>

      <DomainPathPicker value={domainPath} onChange={selectPath} />

      {domainPath === "owned" ? (
        <div className="space-y-4">
          <BringYourOwnDomain
            attachedDomain={customDomain || null}
            defaultDomain={customDomain}
          />
          {onClose && (
            <div className="flex justify-start">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className={cn(
                  "h-12 rounded-2xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50 px-10",
                )}
              >
                إغلاق
              </Button>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <DomainSettingsFields
            domain={domain}
            domainType={domainType}
            domainChecked={domainChecked}
            domainAvailable={domainAvailable}
            isCheckingDomain={isCheckingDomain}
            dynadotResult={dynadotResult}
            onDomainChange={handleDomainChange}
            onCheck={checkDomain}
          />

          {domainPath === "subdomain" && (
            <DomainNote>
              {canRenameSlug
                ? `يمكن تغيير النطاق الفرعي مرة كل ${RENAME_COOLDOWN_DAYS} يوم. آخر تحديث: ${formattedLastUpdate}`
                : `لا يمكن التغيير الآن — يجب مرور ${RENAME_COOLDOWN_DAYS} يوم. آخر تحديث: ${formattedLastUpdate}`}
            </DomainNote>
          )}

          {domainPath === "subdomain" && (
            <DomainNote tone="warning">
              تغيير النطاق ينقل عنوان المتجر. يبقى المتجر غير متاح على العنوان
              الجديد حتى إعادة نشره، لذا أعد النشر مباشرة بعد الحفظ.
            </DomainNote>
          )}

          {domainPath === "buy" && (
            <>
              <PaymentProviderPicker
                value={paymentProvider}
                onChange={setPaymentProvider}
                disabled={isSaving}
              />
              <DomainNote>
                يتم تسجيل الدومين باسمك بعد إتمام الدفع، ثم نربطه بالمتجر
                تلقائياً.
              </DomainNote>
            </>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row-reverse sm:items-center">
            <Button
              type="submit"
              disabled={
                !canSave || isSaving || (domainPath === "buy" && !paymentProvider)
              }
              className="h-12 flex-1 gap-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSaving ? (
                <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
              ) : (
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              )}
              {isSaving
                ? "جاري المعالجة..."
                : domainPath === "buy" && pricing
                  ? `الدفع عبر ${paymentProviderLabel(paymentProvider)} — ${formatUsd(pricing.totalUsd)}`
                  : "حفظ الدومين"}
            </Button>

            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className={cn(
                  "h-12 rounded-2xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50 sm:w-40",
                )}
              >
                إلغاء
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );

  return (
    <div className="grid max-h-[85dvh] grid-cols-1 overflow-hidden md:grid-cols-[minmax(0,1fr)_320px]">
      {/* Form first: in RTL the first grid child takes the right-hand column. */}
      <div className="order-2 min-w-0 overflow-y-auto p-6 md:order-1 md:p-8 hide-scrollbar">
        <header className="mb-6 flex items-start gap-3 text-right">
          {/* The panel that carries the close button is hidden on small
              screens, so the header has to offer one there. */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 md:hidden dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
            </button>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              إعدادات الدومين
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
              اختر المصدر المناسب لربط دومين مخصص بـMEL، مثل:{" "}
              <span dir="ltr">qwafer.com</span>
            </p>
          </div>

        </header>

        {body}
      </div>

      <DomainBrandPanel
        onClose={onClose}
        className="order-1 hidden md:order-2 md:flex"
      />
    </div>
  );
};

export default DomainSettingsSection;
