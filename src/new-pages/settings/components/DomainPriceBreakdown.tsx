import type { DynadotSearchResult } from "@/api/endpoints/dynadot.endpoints";
import { formatUsd, getDomainPurchasePricing } from "@/utils/domainPricing";

type DomainPriceBreakdownProps = {
  result: DynadotSearchResult;
};

const DomainPriceBreakdown = ({ result }: DomainPriceBreakdownProps) => {
  const pricing = getDomainPurchasePricing(result.price);

  if (!result.supported) {
    return (
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {result.error || "نوع الدومين غير مدعوم للتسجيل عبر Dynadot"}
      </p>
    );
  }

  if (!result.available) {
    return (
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {result.premium
          ? "دومين premium — التسجيل متاح لاحقاً"
          : "الدومين مسجّل مسبقاً وغير متاح"}
      </p>
    );
  }

  if (!pricing) {
    return (
      <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
        الدومين متاح — تعذر قراءة السعر. حاول التحقق مرة أخرى.
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-2 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-slate-500 dark:text-slate-400">تسجيل الدومين</span>
        <span className="font-medium text-slate-900 dark:text-slate-100" dir="ltr">
          {formatUsd(pricing.registrationUsd)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-slate-500 dark:text-slate-400">رسوم MEL</span>
        <span className="font-medium text-slate-900 dark:text-slate-100" dir="ltr">
          {formatUsd(pricing.markupUsd)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-2 dark:border-slate-800">
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          المجموع
        </span>
        <span
          className="text-base font-bold text-slate-900 dark:text-slate-100"
          dir="ltr"
        >
          {formatUsd(pricing.totalUsd)}
        </span>
      </div>
      {pricing.renewalUsd != null && (
        <p className="text-[13px] text-slate-500 dark:text-slate-400">
          تجديد سنوي لاحقاً: {formatUsd(pricing.renewalUsd)}
        </p>
      )}
      <p className="text-[13px] text-slate-500 dark:text-slate-400">
        يُحوَّل المبلغ للدينار العراقي عند الدفع
      </p>
    </div>
  );
};

export default DomainPriceBreakdown;
