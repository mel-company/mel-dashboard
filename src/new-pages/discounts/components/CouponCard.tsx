import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CouponListItem } from "@/api/types/coupon";
import {
  formatCouponUsage,
  formatCouponValue,
} from "../coupon-utils";
import { formatTableDate, formatTableTime, shortText } from "../utils";

type CouponCardProps = {
  coupon: CouponListItem;
  onClick: () => void;
  footer?: ReactNode;
  className?: string;
};

const CouponCard = ({ coupon, onClick, footer, className }: CouponCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-full w-full flex-col gap-4 rounded-[20px] bg-white p-4 text-right dark:bg-[#0a0e27]",
        className,
      )}
    >
      <div className="flex items-center gap-3" dir="ltr">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-[#9a5cff]/10">
          <span className="text-[11px] font-black text-amber-600 dark:text-[#b282ff]">
            {formatCouponValue(coupon)}
          </span>
        </div>
        <div className="min-w-0 flex-1 text-right" dir="rtl">
          <h3 className="line-clamp-1 text-base font-bold text-slate-900 dark:text-[#e4e7fc]" dir="ltr">
            {coupon.code}
          </h3>
          <p className="mt-1 text-xs text-slate-400 dark:text-[#a4b1fa]">
            استُخدم {formatCouponUsage(coupon)}
          </p>
        </div>
      </div>

      <p className="line-clamp-2 text-right text-[13px] leading-[19.5px] text-slate-400 dark:text-[#a4b1fa]">
        {shortText(coupon.description, 120)}
      </p>

      <div className="h-px bg-slate-100 dark:bg-[#1f2448]/40" />

      {footer !== undefined ? footer : (
        <div className="flex items-center justify-between gap-2" dir="ltr">
          <p className="text-xs text-slate-400 dark:text-[#a4b1fa]" dir="rtl">
            {formatTableDate(coupon.startsAt)} — {formatTableDate(coupon.expiresAt)}
          </p>
          <p className="text-xs font-light text-slate-400 dark:text-[#a4b1fa]">
            {formatTableTime(coupon.expiresAt)}
          </p>
        </div>
      )}
    </button>
  );
};

export default CouponCard;
