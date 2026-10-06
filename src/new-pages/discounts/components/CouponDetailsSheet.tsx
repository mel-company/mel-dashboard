import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Copy, Loader2, Pencil, Percent, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import {
  useFetchCoupon,
  useToggleCouponActive,
} from "@/api/wrappers/coupon.wrappers";
import type { CouponListItem } from "@/api/types/coupon";
import { formatCurrency, formatNumber } from "@/utils/format-currency";
import {
  formatAppliesTo,
  formatCouponValue,
  getCouponCategoryCount,
  getCouponProductCount,
  getCouponStatusMeta,
  getCouponTypeLabel,
  getCouponUsageCount,
  getCouponUsageProgress,
  isCouponExpired,
  isCouponNotStarted,
} from "../coupon-utils";
import { formatTableDate, formatTableTime } from "../utils";

type CouponDetailsSheetProps = {
  /** The row that was opened. `null` keeps the drawer closed. */
  coupon: CouponListItem | null;
  onOpenChange: (open: boolean) => void;
  onDelete?: (coupon: CouponListItem) => void;
  /** Refresh the list behind the drawer after a status change. */
  onChanged?: () => void;
};

const Tile = ({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-2xl bg-slate-50 px-4 py-3.5 text-right dark:bg-[#0a0e27]",
      className,
    )}
  >
    <p className="text-xs text-slate-400 dark:text-[#a4b1fa]">{label}</p>
    <div className="mt-1.5 text-[15px] font-bold text-slate-900 dark:text-[#e4e7fc]">
      {children}
    </div>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="space-y-3">
    <h3 className="text-right text-sm font-medium text-slate-500 dark:text-[#a4b1fa]">
      {title}
    </h3>
    {children}
  </div>
);

const CouponDetailsSheet = ({
  coupon,
  onOpenChange,
  onDelete,
  onChanged,
}: CouponDetailsSheetProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isCopied, setIsCopied] = useState(false);

  const open = !!coupon;

  // The row already carries everything the drawer shows, so it renders filled
  // from the first frame; the detail call only refreshes counts behind it.
  const { data: fresh } = useFetchCoupon(coupon?.id ?? "", open);
  const details: CouponListItem = fresh ? { ...coupon, ...fresh } : (coupon as CouponListItem);

  const { mutate: toggleCoupon, isPending: isToggling } =
    useToggleCouponActive();

  useEffect(() => {
    if (!isCopied) return;
    const timer = setTimeout(() => setIsCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [isCopied]);

  useEffect(() => {
    if (!open) setIsCopied(false);
  }, [open]);

  if (!coupon) return null;

  const status = getCouponStatusMeta(details);
  const expired = isCouponExpired(details);
  const notStarted = isCouponNotStarted(details);
  const usage = getCouponUsageCount(details);
  const limit = details.usageLimit ?? null;
  const progress = getCouponUsageProgress(usage, limit && limit > 0 ? limit : 100);
  const products = getCouponProductCount(details);
  const categories = getCouponCategoryCount(details);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(details.code);
      setIsCopied(true);
      toast.success("تم نسخ رمز الكوبون");
    } catch {
      toast.error("فشل في نسخ رمز الكوبون");
    }
  };

  const handleToggle = () => {
    if (expired) return;
    toggleCoupon(details.id, {
      onSuccess: () => {
        toast.success(details.isActive ? "تم تعطيل الكوبون" : "تم تفعيل الكوبون");
        onChanged?.();
      },
      onError: () => toast.error("فشل في تحديث حالة الكوبون"),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Same edge-drawer shell as CreateCouponDialog: details is a side modal,
          not a page the merchant has to navigate back out of. */}
      <SheetContent
        side={isMobile ? "bottom" : "left"}
        dir="rtl"
        showCloseButton={false}
        className={cn(
          "z-[60] flex flex-col gap-0 border-0 p-0 text-foreground",
          "bg-white dark:bg-[#12183b]",
          isMobile
            ? cn(
                "inset-x-0 bottom-0 top-auto h-auto max-h-[92dvh] w-full max-w-none rounded-t-[32px]",
                "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
              )
            : cn(
                "top-3 bottom-3 left-3 h-auto w-[min(100%,560px)] max-w-[560px] rounded-[32px]",
                "data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
              ),
        )}
      >
        {isMobile ? (
          <div className="flex shrink-0 justify-center pt-3">
            <span className="h-1.5 w-12 rounded-full bg-border" />
          </div>
        ) : null}

        {/* RTL: the first child sits rightmost, so the badge leads on the right
            as it does in Figma. */}
        <SheetHeader className="shrink-0 flex-row items-start gap-3 space-y-0 border-b border-slate-100 px-5 py-5 text-right sm:px-6 dark:border-[#1f2448]">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-[#9a5cff]/15 dark:text-[#b282ff]">
            <Percent className="size-5" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1 text-right">
            <SheetTitle
              className="truncate text-xl font-bold text-slate-900 dark:text-[#e4e7fc]"
              dir="ltr"
            >
              {details.code}
            </SheetTitle>
            <SheetDescription className="mt-0.5 text-sm text-slate-400 dark:text-[#a4b1fa]">
              تفاصيل الكوبون وحالته الحالية
            </SheetDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="إغلاق"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-[#4a5596] dark:hover:bg-white/5 dark:hover:text-[#e4e7fc]"
          >
            <X className="size-4" />
          </button>
        </SheetHeader>

        <div className="custom-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-6">
          {/* Hero: value, type and the one control a merchant reaches for. */}
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-[#0a0e27]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-violet-100 px-2.5 py-1 text-sm font-bold text-violet-700 dark:bg-[#9a5cff]/15 dark:text-[#b282ff]">
                  {formatCouponValue(details)}
                </span>
                <span className="text-xs text-violet-600 dark:text-[#b282ff]">
                  {getCouponTypeLabel(details)}
                </span>
              </div>
              {expired ? (
                <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 dark:bg-[#ff5252]/15 dark:text-[#ff5252]">
                  منتهي
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  {isToggling ? (
                    <Loader2 className="size-4 animate-spin text-slate-400" />
                  ) : null}
                  <Switch
                    checked={status.switchChecked}
                    disabled={isToggling}
                    activeLabel="مُفعل"
                    disabledLabel="معطل"
                    onToggle={handleToggle}
                  />
                </div>
              )}
            </div>

            {notStarted && !expired ? (
              <p className="mt-3 text-right text-xs text-amber-600 dark:text-[#ffb547]">
                لم يبدأ بعد — يبدأ في {formatTableDate(details.startsAt)}
              </p>
            ) : null}

            <p className="mt-3 text-right text-sm leading-6 text-slate-500 dark:text-[#a4b1fa]">
              {details.description?.trim() || "لا يوجد وصف لهذا الكوبون"}
            </p>

            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[14px] text-sm font-semibold transition-colors",
                isCopied
                  ? "bg-emerald-500/12 text-emerald-600 dark:bg-[#00dfa8]/12 dark:text-[#00dfa8]"
                  : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-[#12183b] dark:text-[#a4b1fa] dark:hover:bg-white/5",
              )}
            >
              {isCopied ? (
                <>
                  <Check className="size-4" />
                  تم نسخ الرمز
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  نسخ رمز الكوبون
                </>
              )}
            </button>
          </div>

          <Section title="تفاصيل الخصم">
            <div className="grid grid-cols-2 gap-3">
              <Tile label="قيمة الخصم">
                <span className="text-violet-600 dark:text-[#b282ff]">
                  {formatCouponValue(details)}
                </span>
              </Tile>
              <Tile label="نوع الخصم">{getCouponTypeLabel(details)}</Tile>
              <Tile label="الحد الأدنى للطلب">
                {details.minOrderTotal
                  ? formatCurrency(details.minOrderTotal, "0 د.ع")
                  : "بدون حد أدنى"}
              </Tile>
              <Tile label="نطاق التطبيق">
                {formatAppliesTo(details.appliesTo)}
              </Tile>
            </div>
          </Section>

          <Section title="الاستخدام">
            <div className="rounded-2xl bg-slate-50 px-4 py-3.5 dark:bg-[#0a0e27]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400 dark:text-[#a4b1fa]">
                  مرات الاستخدام
                </span>
                <span className="text-[15px] font-bold tabular-nums text-emerald-600 dark:text-[#00dfa8]">
                  {formatNumber(usage)}
                  {limit && limit > 0 ? (
                    <span className="text-slate-400 dark:text-[#4a5596]">
                      {" / "}
                      {formatNumber(limit)}
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-[#12183b]">
                <div
                  className="h-full rounded-full bg-emerald-500 dark:bg-[#00dfa8]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {!limit || limit <= 0 ? (
                <p className="mt-2 text-right text-[11px] text-slate-400 dark:text-[#4a5596]">
                  لا يوجد حد أقصى لعدد الاستخدامات
                </p>
              ) : null}
            </div>
          </Section>

          <Section title="المدة">
            <div className="grid grid-cols-2 gap-3">
              <Tile label="تاريخ البدء">
                {formatTableDate(details.startsAt)}
                <span className="mt-0.5 block text-xs font-light text-slate-400 dark:text-[#a4b1fa]">
                  {formatTableTime(details.startsAt)}
                </span>
              </Tile>
              <Tile label="تاريخ النفاذ">
                {formatTableDate(details.expiresAt)}
                <span className="mt-0.5 block text-xs font-light text-slate-400 dark:text-[#a4b1fa]">
                  {formatTableTime(details.expiresAt)}
                </span>
              </Tile>
            </div>
          </Section>

          <Section title="المشمولات">
            <div className="grid grid-cols-2 gap-3">
              <Tile label="الفئات">
                <span className="text-sky-600 dark:text-[#33c5ff]">
                  {formatNumber(categories)} فئة
                </span>
              </Tile>
              <Tile label="المنتجات">
                <span className="text-sky-600 dark:text-[#33c5ff]">
                  {formatNumber(products)} منتجاً
                </span>
              </Tile>
            </div>
          </Section>
        </div>

        {/* RTL: `flex-row` puts the first child rightmost, so the primary action
            lands on the right and حذف on the far left, as drawn. */}
        <SheetFooter
          className={cn(
            "shrink-0 border-t border-slate-100 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 dark:border-[#1f2448]",
            isMobile
              ? "flex-col gap-3 sm:flex-col"
              : "flex-row items-center justify-between gap-3 sm:flex-row sm:space-x-0",
          )}
        >
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              navigate(`/coupons/${details.id}/edit`);
            }}
            className={cn(
              "flex h-[60px] items-center justify-center gap-2 rounded-2xl bg-linear-to-l from-[#b282ff] to-[#33c5ff] text-lg font-bold text-white transition-opacity hover:opacity-90",
              isMobile ? "w-full" : "min-w-[233px] px-10",
            )}
          >
            <Pencil className="size-4" />
            تعديل الكوبون
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onDelete?.(details);
            }}
            className={cn(
              "flex items-center justify-center gap-2 text-lg font-bold text-red-500 transition-colors hover:text-red-600 dark:text-[#ff5252] dark:hover:text-[#ff7b7b]",
              isMobile ? "h-auto w-full py-2" : "h-[60px] min-w-[120px]",
            )}
          >
            <Trash2 className="size-4" />
            حذف
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CouponDetailsSheet;
