import type { ReactNode, MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { DISCOUNT_STATUS } from "@/utils/constants";
import type { DiscountListItem } from "@/api/types/discount";
import {
  formatTableDate,
  getDiscountProductCount,
  getDiscountCategoryCount,
  getDiscountStatusMeta,
  getDiscountUsageCount,
  getDiscountUsageProgress,
  shortText,
} from "../utils";

type DiscountCardProps = {
  discount: DiscountListItem;
  onClick?: () => void;
  onToggleStatus?: (discount: DiscountListItem) => void;
  /** When set, replaces the default bottom meta row. Pass `null` to hide it. */
  footer?: ReactNode;
  className?: string;
  /** Show status switch as display-only (e.g. delete preview). */
  preview?: boolean;
};

const DiscountCard = ({
  discount,
  onClick,
  onToggleStatus,
  footer,
  className,
  preview = false,
}: DiscountCardProps) => {
  const pct = discount.discount_percentage ?? 0;
  const status = getDiscountStatusMeta(discount.discount_status);
  const isExpired = discount.discount_status === DISCOUNT_STATUS.EXPIRED;
  const usage = getDiscountUsageCount(discount);
  const progress = getDiscountUsageProgress(usage);
  const products = getDiscountProductCount(discount);
  const categories = getDiscountCategoryCount(discount);
  const canToggle = !preview && !isExpired && !!onToggleStatus;

  const handleToggleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="rounded-lg bg-violet-100 px-2 py-1 text-[11px] font-bold text-violet-700 dark:bg-[#9a5cff]/15 dark:text-[#b282ff]">
            %{pct}
          </span>
          <span className="text-xs text-violet-600 dark:text-[#b282ff]">
            نسبة مئوية
          </span>
        </div>
        <div onClick={handleToggleClick}>
          {isExpired ? (
            <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 dark:bg-[#ff5252]/15 dark:text-[#ff5252]">
              منتهي
            </span>
          ) : (
            <Switch
              checked={status.switchChecked}
              activeLabel="مُفعل"
              disabledLabel="معطل"
              disabled={!canToggle}
              onToggle={
                canToggle ? () => onToggleStatus?.(discount) : undefined
              }
            />
          )}
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1 text-right">
          <h3 className="line-clamp-1 text-[15px] font-bold text-slate-900 dark:text-[#f0f2ff]">
            {discount.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-[17px] text-slate-400 dark:text-[#a4b1fa]">
            {shortText(discount.description, 90)}
          </p>
        </div>
        <div className="shrink-0 space-y-1 text-right">
          <p className="text-xs">
            <span className="font-extrabold text-slate-900 dark:text-white">
              {categories}{" "}
            </span>
            <span className="text-sky-600 dark:text-[#33c5ff]">فئة</span>
          </p>
          <p className="text-xs">
            <span className="text-slate-800 dark:text-[#e4e7fc]">
              {products}{" "}
            </span>
            <span className="text-sky-600 dark:text-[#33c5ff]">منتجاً</span>
          </p>
        </div>
      </div>

      <div className="h-px bg-slate-100 dark:bg-[#1f2448]" />

      {footer !== undefined ? (
        footer
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 dark:text-[#a4b1fa]">
              مرات الاستخدام
            </p>
            <div className="mt-1 flex items-center justify-end gap-1">
              <div className="h-1 w-8 overflow-hidden rounded-full bg-slate-200 dark:bg-[#12183b]">
                <div
                  className="ms-auto h-full rounded-full bg-emerald-500 dark:bg-[#00dfa8]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-[#00dfa8]">
                {usage}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 dark:text-[#a4b1fa]">
                تاريخ البدء
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-900 dark:text-white">
                {formatTableDate(discount.discount_start_date)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 dark:text-[#a4b1fa]">
                تاريخ النفاذ
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-900 dark:text-white">
                {formatTableDate(discount.discount_end_date)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const shellClass = cn(
    "flex w-full flex-col gap-3 rounded-2xl bg-white p-4 text-right dark:bg-[#0a0e27]",
    className,
  );

  if (onClick && !preview) {
    return (
      <button type="button" onClick={onClick} className={shellClass}>
        {content}
      </button>
    );
  }

  return <div className={shellClass}>{content}</div>;
};

export default DiscountCard;
